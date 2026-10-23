import { BaseRepository } from "./base.repository"
import { IComment } from "../../common/interfaces/comment.interface"
import Comment from "../models/comment.model"

export  class CommentRepository extends BaseRepository<IComment>{
    constructor(){
        super(Comment)
    }

}