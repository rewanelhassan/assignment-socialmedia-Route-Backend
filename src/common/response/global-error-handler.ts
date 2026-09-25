import { ErrorRequestHandler, NextFunction, Request, Response } from "express"

interface IError extends Error {
    statusCode : number ;
}

export const globalError: ErrorRequestHandler=(
    err:IError , 
    req:Request,
    res:Response,
    next:NextFunction
)=>{

    const message = err.message || "internal server error";
    const status = err.statusCode || 500 ;

    res.status(status).json({message , cause:err.cause, stack : err.stack})
}

