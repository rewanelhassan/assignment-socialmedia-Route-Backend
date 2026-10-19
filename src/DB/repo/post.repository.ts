import { BaseRepository } from "./base.repository"
import { IPost } from "../../common/interfaces/post.interface"
import Post from "../models/post.model"

export  class PostRepository extends BaseRepository< IPost>{
    constructor(){
        super(Post)
    }

}