import type { Request,Response,NextFunction, RequestHandler } from "express";
import { z } from "zod";
import { AppError } from "../errors/app.error";


// 中间件工厂
type ValidateTarget="body"|"query"|"params"

export const vaildateMiddleware=<T extends z.ZodType>(target:ValidateTarget,schema:T):RequestHandler=>{
    return (req,res,next)=>{
        const result=schema.safeParse(req[target]);
        if(!result.success){
            const issue=result.error.issues[0]
            throw new AppError(issue?.message || "格式错误",400)
        }
        req.validated={
            ...req.validated,
            [target]:result.data
        };
        next()
}}

export const vaildateID=(schemea:z.ZodType)=>{
    return (req:Request,res:Response,next:NextFunction)=>{
        // console.log(1)
        const result=schemea.safeParse(req.params)
        // console.log(req.params)
        if(!result.success){
            res.status(400).json({
                message:"格式错误",
                error:result.error.issues
            })
            return
        }
        next()
    }
}

