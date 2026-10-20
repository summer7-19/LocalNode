import { Request,Response,NextFunction } from "express";
import { redisClient } from "../config/redis";


export const testRedis = async (req:Request,res:Response,next:NextFunction) => {
    try{
        await redisClient.set('localnote:test','Redis连接成功')
        const result = await redisClient.get('localnote:test');
        res.status(200).json({message:"连接成功",data:result})
    }catch(err){
        next(err);
    }
}