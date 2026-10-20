export const emailCodeKey=(purpose:string,email:string)=>{
    return `email:code:${purpose}:${email}`
}

export const emailCooldownKey=(purpose:string,email:string)=>{
    return `email:cooldown:${purpose}:${email}`
}

export const captchaKey=(captchaId:string)=>{
    return `captcha:image:${captchaId}`
}