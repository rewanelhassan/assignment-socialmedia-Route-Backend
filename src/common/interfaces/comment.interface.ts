
import {Types} from "mongoose"
 
export type IComment ={
    post_id:Types.ObjectId,
    reply_to:Types.ObjectId,
    content:string ,
    attachment:string[] ,
    likes:Types.ObjectId [],
    tags:Types.ObjectId [],
    createdBy:Types.ObjectId,

    createdAt?: Date ,
    updatedAt?: Date ,
    deletedAt?: Date ,
    restoredAt?: Date ,

}