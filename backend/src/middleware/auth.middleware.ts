import type { Request,Response,NextFunction } from "express"
import { AppError } from "../errors/app.error"
import jwt, { JwtHeader, JwtPayload } from 'jsonwebtoken'
import { config } from "../config/env"

interface JWTuserPayload{
    userID:number
}

export const authMiddleware=async(req:Request,res:Response,next:NextFunction)=>{
    const result=req.headers.authorization
    if(!result){
        throw new AppError('未登录',401)
    }
    const [type,token]=result?.split(' ');
    if(!token||type!=='Bearer'){
        throw new AppError('token格式错误',401)
    }

    try{
        const payload=jwt.verify(token,config.jwt.JWT_SECRET) as JWTuserPayload
        // console.log(payload)
        req.user=payload
        next()
    }catch(err){
        throw new AppError('token无效',401)
    }
}