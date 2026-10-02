import { HydratedDocument } from "mongoose";
import { IUser } from "./user.interface";
import { JwtPayload } from "jsonwebtoken";

declare module "express-serve-static-core"{
    interface Request{
        user?:HydratedDocument<IUser>;
        decoded?:JwtPayload
    }
}