import {  Types, model , Schema } from "mongoose"
import { IComment } from "../../common/interfaces/comment.interface";
import { string } from "zod";



const commentSchema = new Schema<IComment>({
    post_id:{
        type:Types.ObjectId,
        ref:"Post",
        required:true,
    },
    reply_to:{
        type:Types.ObjectId,
        ref:"Comment",
        required:true,

    },
    content:{
        type:String,
        trim:true,
        required: function ():boolean{
            return this.attachment.length==0 ;
        }
        
    },
    attachment: [String],
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
    deletedAt:Date ,
    restoredAt:Date ,

   

},{
    timestamps:true,
    collection:"posts",
    optimisticConcurrency:true,
    strict:true,
    strictQuery:true,

})
 

 const Comment = model<IComment>("Post",commentSchema)
 export default Comment ;