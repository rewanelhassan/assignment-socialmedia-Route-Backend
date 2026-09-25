import express, {  Request, Response, NextFunction } from "express";
import { type Express } from "express";
import { authRouter } from "./modules";
import { userRouter } from "./modules";
import { globalError } from "./common/response";
import { config } from "dotenv";
import {DBconnection} from "./DB/connection"
import redisService from "./common/services/redis.service";

const bootstrap = async ()=>{
    config()
    const app:Express = express()
    app.use(express.json())

   
    await DBconnection();
    // await redisService.connection()  

    app.get("/",(req:Request ,res:Response , next:NextFunction):void=>{
        res.status(200).json({
            message:"hello TS"
        })

    })

    app.use("/auth" , authRouter)
    app.use("/user" , userRouter)
    app.use(globalError)

    app.listen(8000,()=>{
        console.log("sever is working.......")
    })
    console.log("app is running")

}

export default bootstrap ;