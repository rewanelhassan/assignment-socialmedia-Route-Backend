import { Types } from "mongoose";
import { StorageTypeEnum } from "../../common/enums/storage";
import { BadRequestException, NotFoundException } from "../../common/response";
import { UserHydrated } from "../../DB/models/user.model";
import { UserRepository } from "../../DB/repo/user.repository";
import { ICreateComment, IUpdateComment } from "./dto/comment.dto";
import redisService from "../../common/services/redis.service";
import s3Service from "../../common/services/s3.service";
import notificationService from "../../common/services/notification.service";
import { paginationQuery } from "../../common/utils/general-validation";
import { AvailableEnum } from "../../common/enums/available";
import { CommentRepository } from "../../DB/repo/comment.repository";

export class CommentService {
  private commentRepo: CommentRepository;
  private userRepo: UserRepository;
  private redisService;
  private s3service;
  private notificationService;
  constructor() {
    this.commentRepo = new CommentRepository();
    this.userRepo = new UserRepository();
    this.redisService = redisService;
    this.s3service = s3Service;
    this.notificationService = notificationService;
  }

  async create(
    data: ICreateComment,
    files: Express.Multer.File[],
    StorageType: StorageTypeEnum,
    user: UserHydrated,
  ) {
    if (!data.content && !files.length) {
      throw new BadRequestException("must add files or content");
    }
    let mentions: string[] = [];
    let FCM_Token_Mention: string[] = [];
    const { available, content, tags } = data;
    if (tags?.length) {
      const unique = [...new Set(tags)];
      const users = await this.userRepo.find({
        filter: {
          _id: {
            $in: unique.map((e) => new Types.ObjectId(e)),
          },
        },
      });

      if (users.length != unique.length) {
        throw new BadRequestException("missing users");
      }

      for (let tag of tags) {
        mentions.push(tag);
        const tokens = await this.redisService.getFCMToken(tag);
        tokens.forEach((e) => {
          FCM_Token_Mention.push(e);
        });
      }
    }

    let urls: any[] = [];
    if (files) {
      urls = await this.s3service.uploadFiles({
        files,
        folder: "comments",
        path: `${user._id}`,
        StorageType,
      });
    }
    const comment = await this.commentRepo.create({
      data: {
        content: data.content ?? "",
        attachment: urls,
        post_id:new Types.ObjectId(data.post_id),
        tags: tags?.map((e) => new Types.ObjectId(e)) || [],
        createdBy: user._id,
      },
    });
    if (!comment && urls.length) {
      this.s3service.deletFiles({
        files: urls,
      });
      throw new BadRequestException("comment not created");
    }

    if (FCM_Token_Mention.length) {
      FCM_Token_Mention.forEach((token) => {
        this.notificationService.sendNotification({
          token,
          title: "new comment",
          data: "new comment added",
        });
      });
    }
    return comment;
  }

  async find(filter: paginationQuery, user: UserHydrated) {
    const { page = 1, limit = 10, search = "" } = filter;
    const Comments = await this.commentRepo.paginate({
      filter: {
        $or: [
          { available: AvailableEnum.PUBLIC },
          { available: AvailableEnum.PRIVATE, createdBy: user._id },
          {
            available: AvailableEnum.FRIENDS,
            createdBy: {
              $in: [user._id, ...(user.friends || [])],
            },
          },
          {
            tags: {
              $in: [user._id],
            },
          },
        ],
        ...(search && { content: { $regex: search, $options: "i" } }),
      },
      limit,
      page,
    });
    return Comments;
  }

  async update(
    postId: string,
    data: IUpdateComment,
    user: UserHydrated,
    StorageType: StorageTypeEnum,
    files?: Express.Multer.File[],
  ) {
    let mentions: string[] = [];
    const{post_id,tags, remove_attachment, remove_tags,content }=data
    let FCM_Token_Mention: string[] = [];
    if (tags?.length) {
      const unique = [...new Set(tags)];
      const users = await this.userRepo.find({
        filter: {
          _id: {
            $in: unique.map((e) => new Types.ObjectId(e as string)),
          },
        },
      });

      if (users.length != unique.length) {
        throw new BadRequestException("missing users");
      }

      for (let tag of tags) {
        mentions.push(tag);
        const tokens = await this.redisService.getFCMToken(tag);
        tokens.forEach((e) => {
          FCM_Token_Mention.push(e);
        });
      }
    }

    let urls: any[] = [];
    if (files) {
      urls = await this.s3service.uploadFiles({
        files,
        folder: "posts",
        path: `${user._id}`,
        StorageType,
      });
    }
    const comment = await this.commentRepo.findOneAndUpdate({
      filter: {
        _id: new Types.ObjectId(postId),
        createdBy: user._id,
      },
      update: [{
        $set:{
            ...(post_id &&{post_id}),
            ...(content &&{content}),
            updated_by:user._id,
            attachment:{
                $setUnion:[
                    {
                        $setDifference:["$attachment",remove_attachment],
                    },urls
                ]

            },
            tags:{
                $setUnion:[
                    {
                        $setDifference:["$tags",remove_tags?.map((e)=>new Types.ObjectId(e) || [])],
                    },urls
                ]

            }

        }
      }],
      options:{new: true}
    });
    if (!comment) {
      throw new BadRequestException("comment not found");
    }

    if(remove_attachment?.length){
        await this.s3service.deletFiles({
            files:remove_attachment
        })
    }

    return comment ;



  }

  async reactComment(postId:string , user:UserHydrated){
    const comment = await this.commentRepo.findOne({
      filter: {
        _id:new Types.ObjectId(postId),
        $or: [
          { available: AvailableEnum.PUBLIC },
          { available: AvailableEnum.PRIVATE, createdBy: user._id },
          {
            available: AvailableEnum.FRIENDS,
            createdBy: {
              $in: [user._id, ...(user.friends || [])],
            },
          },
          {
            tags: {
              $in: [user._id],
            },
          },
        ],
         
      },
    });

    if(!comment){
      throw new NotFoundException("post not found")
    }
    if(comment.likes.includes(user._id)){
      return await this.commentRepo.findOneAndUpdate({
        filter:{
          _id:new Types.ObjectId(postId)
        },
        update:{
          $pull:{
            likes:user._id,
          }
        },
        options:{
          new:true
        }
      })
    }

    return await this.commentRepo.findOneAndUpdate({
        filter:{
          _id:new Types.ObjectId(postId)
        },
        update:{
          $addToSet:{
            likes:user._id,
          }
        },
        options:{
          new:true
        }
      })


  }
}

export const commentService = new CommentService();
