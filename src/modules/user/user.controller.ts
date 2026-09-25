import { Router, Request, Response, NextFunction } from "express";
import { BadRequestException, successResponse } from "../../common/response";
 

const userRouter = Router()

userRouter.get("/",(req:Request,res:Response,next:NextFunction)=>{

    throw new BadRequestException("invalid api " , 400 )
    // return successResponse<{username:string , age:number}>({
    //     res ,  
    //     data:{ username:"omnia" , age:50 },
    // })


})

export default userRouter ;

