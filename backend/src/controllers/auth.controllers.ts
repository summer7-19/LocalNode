import type { Request,Response,NextFunction } from "express"
import {RegisterService, LoginService} from "../services/auth.services"
import {registerDto, loginDto} from "../schema/auth.schema"
import { AppError } from "../errors/app.error"
import { asyncHandler } from "../utils/asyncHandler"

export const login=asyncHandler
(async(req:Request<{id:string},{},loginDto>,res:Response,next:NextFunction)=>{
        const data=req.body
        const result=await LoginService(data)
        res.status(200).json(result)
})

export const Register=async(req:Request<{},{},registerDto>,res:Response,next:NextFunction)=>{
    try{
        const data=req.body
        const result=await RegisterService(data)
        if(result.affectedRows===0){
            throw new AppError("User already exists", 409)
        }
        res.status(200).json({message:"User registered successfully"})
    }catch(err){
        next(err)
    }
}