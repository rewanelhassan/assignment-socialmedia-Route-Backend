import User from "../DB/models/user.model.js";
import { NextFunction, Request, Response } from "express";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../common/response/application-exception.js";
import tokenService from "../common/services/token.service.js";
import { TokenType } from "../common/enums/token.js";
import { UserRepository } from "../DB/repo/user.repository.js";
import redisService from "../common/services/redis.service.js";
import { HydratedDocument } from "mongoose";
import { IUser } from "../common/interfaces/user.interface.js";
import { JwtPayload } from "jsonwebtoken";
import { Role } from "../common/enums/role.js";


export interface IAuthRequest extends Request{
    user?:HydratedDocument<IUser>;
    decoded?:JwtPayload;

}




export const auth = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const userRepo = new UserRepository();

  if (!req.headers.authorization)
    throw new BadRequestException("token required");

  const token = req.headers.authorization.split(" ")[1] || "";

  if (!token) {
    throw new BadRequestException("token required");
  }
  const decoded = await tokenService.decodeToken(token, TokenType.ACCESS);
  if (!decoded) {
    throw new NotFoundException("user not found");
  }

  const user = await userRepo.findOne({ filter: { _id: decoded.sub } });
  if (!user) {
    throw new NotFoundException("user not found");
  }

  if (
    user.changeConditional &&
    user.changeConditional?.getTime() >= (decoded.iat as number) * 1000
  ) {
    throw new BadRequestException("login again");
  }

  const revokeToken = await redisService.get(
    redisService.tokenKey({ userId: user.id, jti: decoded.jti as string }),
  );

  if (decoded.jti && revokeToken) {
    throw new BadRequestException("login again");
  }

  req.user = user
  req.decoded = decoded
  next();
};

export const authorization = (...roles:Role[])=>{//ال role array
    return async (req:IAuthRequest ,res:Response,next:NextFunction)=>{
        if(!roles.includes((req.user as HydratedDocument<IUser>).role)){
            throw new ForbiddenException("Forbidden")
        }
        next()
    }
}
