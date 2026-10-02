import type { Request,Response,NextFunction } from "express";
import { error } from "node:console";
import { z } from "zod";


// 中间件工厂

export const vaildateMiddleware=(schema:z.ZodType)=>{
    return (req:Request,res:Response,next:NextFunction)=>{
        // console.log("验证中间件");
        const result=schema.safeParse(req.body);
        if(!result.success){
            res.status(400).json({
                message:"格式错误",
                error:result.error.issues
            })
            return
        }
        req.body=result.data;
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


