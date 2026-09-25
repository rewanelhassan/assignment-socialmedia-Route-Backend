import {HydratedDocument, Model}from "mongoose" 
import { BaseRepository } from "./base.repository"
import { IUser } from "../../common/interfaces/user.interface"
import User from "../models/user.model"

export  class UserRepository extends BaseRepository<IUser>{
    constructor(){
        super(User)
    }

}