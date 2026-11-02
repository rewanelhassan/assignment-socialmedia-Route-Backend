import {  Types, model , Schema } from "mongoose"
import { AvailableEnum } from "../../common/enums/available"
import { ChatTypeEnum, IChat, IMessages } from "../../common/interfaces/chat.interface";


const messageSchema= new Schema <IMessages>({
    likes:{
        type:[Types.ObjectId],
        ref:"User",
    },
    tags:{
        type:[Types.ObjectId],
        ref:"User",
    },
    createdBy:{
        type:Types.ObjectId,
        ref:"User",
    },
    content:String,
    attachments:[String],

    
    deletedAt:Date ,
    restoredAt:Date ,

},{
    timestamps:true,
    collection:"posts",
    optimisticConcurrency:true,
    strict:true,
    strictQuery:true,

})


const chatSchema = new Schema<IChat>({
    participants:{
        type: [Types.ObjectId],
        ref:'User'
        
    },
    createdBy:{
        type:Types.ObjectId,
        ref:"User",
    },
    messages:{
        type:[messageSchema],
        required:true,

    },
    type:{
        type:String,
        enum:ChatTypeEnum,
        default:ChatTypeEnum.ovo,
    },
    group_name:{
        type:String ,
        required:function(this){
            return this.type==ChatTypeEnum.ovm
        }

    },
    group_image:String,
    room_id:{
        type:String ,
        required:function(this){
            return this.type==ChatTypeEnum.ovm
        }

    },
    
    deletedAt:Date ,
    restoredAt:Date ,

   

},{
    timestamps:true,
    collection:"chats",
    optimisticConcurrency:true,
    strict:true,
    strictQuery:true,

})
 

 const Chat = model<IChat>("Chat",chatSchema)
 export default Chat ;