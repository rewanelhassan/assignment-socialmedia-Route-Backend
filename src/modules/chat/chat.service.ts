import { HydratedDocument, Types } from "mongoose";
import { ChatRepository } from "../../DB/repo/chat.repository";
import { IUser } from "../../common/interfaces/user.interface";
import { UserRepository } from "../../DB/repo/user.repository";
import { BadRequestException } from "../../common/response";
import { randomUUID } from "node:crypto";
import { ChatTypeEnum } from "../../common/interfaces/chat.interface";

class ChatService {
  private chatRepo;
  constructor() {
    this.chatRepo = new ChatRepository();
  }
  getUserChat = async (
    query: { size: number; page: number },
    userId: string,
    user: HydratedDocument<IUser>,
  ) => {
    const chat = await this.chatRepo.findOneChat({
      filter: {
        participants: {
          $all: [userId, user._id],
        },
      },
      projection: {},
      options: {
        lean: false,
        populate: {
          path: "participants",
        },
      },
      limit: Number(query.size),
      page: Number(query.page),
    });
    return chat;
  };

  sendMessage = async (
    data: { content: string; sendTo: string },
    user: HydratedDocument<IUser>,
  ) => {
    let chat = await this.chatRepo.findOneAndUpdate({
      filter: {
        participants: {
          $all: [new Types.ObjectId(data.sendTo), user._id],
        },
      },
      update: {
        $addToSet: {
          messages: {
            content: data.content,
            createdBy: new Types.ObjectId(user._id),
          },
        },
      },
      options: {
        new: true,
      },
    });

    if (!chat) {
      chat = await this.chatRepo.create({
        data: {
          participants: [new Types.ObjectId(data.sendTo), user._id],
          createdBy: user._id,
          messages: [
            {
              content: data.content,
              createdBy: new Types.ObjectId(user._id),
            },
          ],
        },
      });
    }
    return chat;
  };

  createGroup = async (
    data: { group_name: string; participants: Types.ObjectId[] },
    user: HydratedDocument<IUser>,
  ) => {
    const userRepo = new UserRepository();
    const users = await userRepo.find({
      filter: {
        _id: {
          $in: data.participants.map((e) => new Types.ObjectId(e)),
        },
        friends: {
          $in: [new Types.ObjectId(user._id)],
        },
      },
    });

    if (users.length != data.participants.length)
      throw new BadRequestException("users not found");

    let roomId = randomUUID();
    const chat = await this.chatRepo.create({
      data: {
        participants: [
          ...data.participants.map((e) => new Types.ObjectId(e)),
          new Types.ObjectId(user._id),
        ],
        group_name: data.group_name,
        messages: [],
        room_id: roomId,
        type: ChatTypeEnum.ovm,
      },
    });

    return chat;
  };

  getGroupChat = async (
    groupId: string,
    query: { size: number; page: number },
  ) => {
    const chat = await this.chatRepo.findOneChat({
      filter: {
        _id: groupId,
      },
      projection: {},
      options: {
        lean: false,
        populate: {
          path: "participants",
        },
      },
    });
    return chat;
  };

    getGroupChatById = async (
    roomId: string,
  ) => {
    const chat = await this.chatRepo.findOneChat({
      filter: {
        room_id: roomId,
      },
      projection: {},
      options: {
        lean: false,
        populate: {
          path: "participants",
        },
      },
    });
    return chat;
  };

    sendGroupMessage = async (
    data: { content: string; groupId: string },
    user: HydratedDocument<IUser>,
  ) => {
    const {content  , groupId}=data
    let chat = await this.chatRepo.findOneAndUpdate({
      filter: {
        _id:groupId,
        type:ChatTypeEnum.ovm
      },
      update: {
        $addToSet: {
          messages: {
            content: data.content,
            createdBy: user._id,
          },
        },
      },
      options: {
        new: true,
      },
    });

    if (!chat) {
        throw new BadRequestException("group not exist")
 
    }
    return chat;
  };
}

export const chatService = new ChatService();
