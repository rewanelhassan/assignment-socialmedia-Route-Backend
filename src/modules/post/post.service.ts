import { Types } from "mongoose";
import { StorageTypeEnum } from "../../common/enums/storage";
import { BadRequestException } from "../../common/response";
import { UserHydrated } from "../../DB/models/user.model";
import { PostRepository } from "../../DB/repo/post.repository";
import { UserRepository } from "../../DB/repo/user.repository";
import { ICreatePost } from "./dto/post.dto";
import redisService from "../../common/services/redis.service";
import s3Service from "../../common/services/s3.service";
import notificationService from "../../common/services/notification.service";
import { paginationQuery } from "../../common/utils/general-validation";
import { AvailableEnum } from "../../common/enums/available";

export class PostService{
    private postRepo : PostRepository;
    private userRepo :UserRepository;
    private redisService ;
    private s3service;
    private notificationService;
    constructor(){
        this.postRepo = new PostRepository()
        this.userRepo = new UserRepository()
        this.redisService = redisService
        this.s3service=s3Service
        this.notificationService=notificationService

    }

    async create(data:ICreatePost, files:Express.Multer.File[],StorageType:StorageTypeEnum,
        user:UserHydrated
    ){
        if(!data.content && ! files.length){
            throw new BadRequestException("must add files or content")
        }
        let mentions:string[]  = []
        let FCM_Token_Mention:string[]  = []
        const {available , content , tags} = data;
        if(tags?.length){
            const unique = [...new Set(tags)]
            const users = await this.userRepo.find({
                filter:{
                    _id:{
                        $in:unique.map((e)=>new Types.ObjectId(e))
                    }
                }
            })

            if( users.length != unique.length){
                throw new BadRequestException("missing users")
            }

            for(let tag of tags){
                mentions.push(tag)
                const tokens = await this.redisService.getFCMToken(tag);
                tokens.forEach((e)=>{
                    FCM_Token_Mention.push(e)
                })
            }

        }

        let urls:any[] = []
        if(files){
           urls = await this.s3service.uploadFiles({
                files,
                folder:"posts",
                path:`${user._id}`,
                StorageType ,
            })
        }
        const post = await this.postRepo.create({data:{
            content:data.content ?? "",
            attachment:urls,
            tags:tags?.map((e)=> new Types.ObjectId(e))|| [],
            available,
            createdBy:user._id
        }})
        if(!post && urls.length){
            this.s3service.deletFiles({
                files:urls
            })
            throw new BadRequestException("post not created")
        }

        if(FCM_Token_Mention.length){
            FCM_Token_Mention.forEach((token)=>{
                this.notificationService.sendNotification({
                    token,
                    title:"new post",
                    data:"new post added"
                })

            })
        }
        return post
    }

    async find (filter:paginationQuery , user:UserHydrated){
        const {page=1 , limit=10 , search=""}=filter;
        const posts = await this.postRepo.paginate({
            filter:{
                $or:[
                    {available:AvailableEnum.PUBLIC},
                    {available:AvailableEnum.PRIVATE , createdBy:user._id},
                    {available:AvailableEnum.FRIENDS , createdBy: {
                        $in:[user._id , ...(user.friends || [])]

                    }},{
                        tags:{
                            $in:[user._id]
                        }
                    }

                ],
                ...(search && {content :{$regex: search , $options:"i"}})
            },
            limit ,
            page,

        })
        return posts;
    }
}

export const postService =  new PostService()