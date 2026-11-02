import { HydratedDocument } from "mongoose";
import { IUser } from "./user.interface";
import { JwtPayload } from "jsonwebtoken";
import { Socket } from "socket.io";

declare module "express-serve-static-core"{
    interface Request{
        user?:HydratedDocument<IUser>;
        decoded?:JwtPayload
    }
}

export interface IAuthSocket extends Socket{
    user?:HydratedDocument<IUser>;
}