import z from "zod";

export const sendEmailCodeSchema=z.object({
    email:z.email("请输入正确格式邮箱"),
    purpose:z.enum([
        "register","resetPassword"
    ]),
    // captchaId:z.string().min(1,"缺少图片验证码标识"),
    // captchaCode:z.string().trim().min(1,"请输入验证码")
})


export const verifyEmailCodeSchema=z.object({
    email:z.email("请输入正确格式邮箱"),
    code:z.string().trim().min(1,"请输入验证码"),
    purpose:z.enum([
        "register","resetPassword"
    ])
})