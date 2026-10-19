import {  Types, model , Schema } from "mongoose"
import { IPost } from "../../common/interfaces/post.interface"
import { AvailableEnum } from "../../common/enums/available"



const postSchema = new Schema<IPost>({
    content:{
        type:String,
        trim:true,
        required: function ():boolean{
            return this.attachment.length==0 ;
        }
        
    },
    attachment: [String],
    available:{
        type:String,
        enum:AvailableEnum,
        default:AvailableEnum.PUBLIC,
    },
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
 

 const Post = model<IPost>("Post",postSchema)
 export default Post ;