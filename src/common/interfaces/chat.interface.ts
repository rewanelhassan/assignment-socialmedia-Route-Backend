import { Types } from "mongoose";
import { AvailableEnum } from "../enums/available";

export interface IMessages {
  content: string;
  attachments?: string[];
  createdBy: Types.ObjectId;

  likes?: Types.ObjectId[];
  tags?: Types.ObjectId[];

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  restoredAt?: Date;
}

export enum ChatTypeEnum{
    ovo="ovo",
    ovm="ovm"
}

export type IChat = {
  participants: Types.ObjectId[];
  createdBy: Types.ObjectId;

  messages:IMessages[],
  type:ChatTypeEnum;
  group_name?:string;
  group_image?:string;
  room_id?:string;


  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  restoredAt?: Date;
};
