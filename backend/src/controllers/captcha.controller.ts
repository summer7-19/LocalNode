import { Request,Response,NextFunction } from "express"
import { createCaptcha,verifyCaptcha } from "../services/captcha.service"
import { asyncHandler } from "../utils/asyncHandler"

export const getCaptchaController = asyncHandler(async(req:Request,res:Response,next:NextFunction) => {
    const data =  createCaptcha()
    res.status(200).json({
        meaasge:'验证码创建成功',
        data
    })
})

export const verifyCaptchaController = asyncHandler(async(req:Request,res:Response,next:NextFunction) => {
    const {  captchaId,code } = req.body
    console.log(captchaId,code)
    const result = verifyCaptcha(captchaId,code)
    if(!result){
        res.status(400).json({
            message:'验证码错误或过期'
        })
    }else{
        res.status(200).json({
            message:'验证码正确'
        })
    }
})