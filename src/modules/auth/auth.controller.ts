import { Router, Request, Response, NextFunction } from "express";
import authService from "./auth.service";
import { BadRequestException, successResponse } from "../../common/response";
import { loginSchema, signupSchema } from "./auth.validation";
import { validation } from "../../middlewars/validation.middleware";

const authRouter = Router()

authRouter.post("/login", 
    validation(loginSchema),
    async (req:Request,res:Response,next:NextFunction)=>{
 
    const user = await authService.login(req.body)
    successResponse({
        res,
        message:"login successfully",
        data: user
    })

})
authRouter.post("/signup", 
    validation(signupSchema),
    async (req:Request,res:Response,next:NextFunction)=>{
 
    const user = await authService.signup(req.body)
    successResponse({
        res,
        message:"user added successfully",
        data: user
    })

})

export default authRouter ;

