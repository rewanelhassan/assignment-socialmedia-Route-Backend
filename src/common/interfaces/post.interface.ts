
import {Types} from "mongoose"
import {AvailableEnum} from "../enums/available"

export type IPost ={
    content:string ,
    attachment:string[] ,
    likes:Types.ObjectId [],
    tags:Types.ObjectId [],
    available:AvailableEnum,
    createdBy:Types.ObjectId
    
   

    createdAt?: Date ,
    updatedAt?: Date ,
    deletedAt?: Date ,
    restoredAt?: Date ,

}