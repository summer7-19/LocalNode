import { sendEmailCode,verifyEmailCode } from "../services/emailCode.service";
import { Request, Response,NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { verifyCaptcha } from "../services/captcha.service";
import { AppError } from "../errors/app.error";

export const sendEmailCodeController = asyncHandler(async (req: Request, res: Response,next: NextFunction) => {
    const {email,purpose, captchaId,captchaCode} = req.validated.body as{
        email:string,
        purpose: 'register'|'resetPassword',
        captchaId: string,
        captchaCode: string
    };
    const captchaVaild= verifyCaptcha(captchaId,captchaCode)
    if(!captchaVaild){
        throw new AppError("验证码错误",400)
    }
    const result = sendEmailCode(email,purpose);
    res.status(200).json({message:"发送成功",code:result})
})

export const varifyEmailCodeController = asyncHandler(async (req: Request, res: Response,next: NextFunction) => {
    const { email,purpose,captchaId,captchaCode } = req.validated.body as {
        email: string,
        purpose: 'register'|'resetPassword',
        captchaId: string,
        captchaCode: string
    }
    // const captchavaild=await verifyCaptcha(captchaId,captchaCode);

})