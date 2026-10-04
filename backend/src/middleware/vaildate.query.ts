import { RequestHandler } from "express";
import { z } from "zod";

export const validateQuery = <T extends z.ZodType>(schema:T): RequestHandler => {
    return (req,res,next) => {
        const result=schema.safeParse(req.query);
        if(!result.success){
            return res.status(400)
            .json({
                message:"参数错误",
                error:result.error.issues
            });
        }
        req.validated={
            ...req.validated,
            query:result.data
        };
        next();
    }
}