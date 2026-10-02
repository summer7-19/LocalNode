import pool from "../db/db"
import { ResultSetHeader,RowDataPacket } from "mysql2"
import type{registerDto, loginDto} from "../schema/auth.schema"
import { RegisterRepo,LoginRepo } from "../repositories/auth.repositories"
import bcrypt from "bcrypt"
import { AppError } from "../errors/app.error"
import jwt from "jsonwebtoken"
import { config } from "../config/env"


export const RegisterService=async(data:registerDto)=>{
    const result = await RegisterRepo(data)
    return result
}

export const LoginService=async(data:loginDto)=>{
    const result = await LoginRepo(data)
    const users = result as any
    if(users.length==0){
        throw new AppError('用户不存在',401)
    }
    const user = users[0]
    const isCorrect= await bcrypt.compare(
        data.password,
        user.password
    )
    if(!isCorrect){
        throw new AppError('密码错误',401)
    }

    const token =jwt.sign(
        {id:user.userID},
        config.jwt.JWT_SECRET,
        {'expiresIn':'7d'}
    )

    return {
        message:'登录成功',
        accessToken:token
    }
}