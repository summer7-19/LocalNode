import { emailTransporter } from "../config/email"
import { emailFrom } from "../config/email"

export const sendEmail=async(email:string,code:string):Promise<void>=>{
    const info =await emailTransporter.sendMail({
        from:emailFrom,
        to:email,
        subject:"localnote邮箱验证码",
        text:`您的验证码为${code}，请尽快验证`,
        html:`<div>
                <h2>LocalNote 邮箱验证</h2>
                <p>你的邮箱验证码是：</p>
                <h1 style='text-align:center'>${code}</h1>
                <p>验证码有效期为5分钟。</p>
                <p>如果不是你本人操作，请忽略此邮件。</p>
            </div>`
    })
    console.log("邮件投递响应:", info.messageId, info.response);
}