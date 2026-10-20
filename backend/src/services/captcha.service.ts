import svgCaptcha from 'svg-captcha';
import crypto from 'crypto';
import { captchaKey } from '../utils/redisKey';
import { redisClient } from '../config/redis';

export const  createCaptcha = () => {
    const captcha = svgCaptcha.create({
        size:4,
        ignoreChars:'0o1i',
        noise:1,
    });
    const captchaId=crypto.randomUUID();
    const key=captchaKey(captchaId);
    redisClient.set(
        key,
        captcha.text.toUpperCase(),
        {
            EX: 60*5,
        }
    )

    return {
        captchaId,
        image: captcha.data,
    }
}



export const verifyCaptcha=async(captchaId:string,captchaCode:string)=>{
    const key=captchaKey(captchaId);
    const captcha=await redisClient.get(key);
    if(!captcha){
        return false;
    }
    const result=captcha===captchaCode.toUpperCase();
    if(result){
        await redisClient.del(key);
    }
    return result;
}
