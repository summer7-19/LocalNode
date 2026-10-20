import { createEmailCode } from "../utils/emailCode";
import { redisClient } from "../config/redis";
import { emailCodeKey, emailCooldownKey } from "../utils/redisKey";
import { AppError } from "../errors/app.error";
import { sendEmail } from "../utils/sendEmail";


export const sendEmailCode = async (email: string, purpose: string) => {
    const cooldownKey = emailCooldownKey(purpose, email);
    const result = await redisClient.set(cooldownKey, "1", { EX: 60, NX: true });
    const key = emailCodeKey(purpose, email);
    if (result != "OK") {
        throw new AppError("验证码发送过于频繁，请稍后再试", 429);
    }
    const cooldown = await redisClient.get(cooldownKey);
    try {
        const code = createEmailCode();
        await redisClient.hSet(key, { code,attempts:"0"});
        await redisClient.expire(key, 300);
        await sendEmail(email, code)

        return {
            message: '发送成功'
        }
    } catch (error) {
        await redisClient.del(key)
        await redisClient.del(cooldownKey)
        throw error
    }
}

const verifyEmailCodeScript = `
    local savedCode=redis.call('GET',KEYS[1])
    if not savedCode then return 0 end
    if savedCode ~=ARGV[1] then return 0 end
    redis.call('DEL',KEYS[1])
    return 1
`

export const verifyEmailCode = async (email: string, purpose: string, code: string):Promise<boolean> => {
    const key = emailCodeKey(purpose, email);
    const data=await redisClient.hGetAll(key);
    if(!data.code){
        return false;
    }
    const attempts=Number(data.attempts);
    if(attempts>=5){
        await redisClient.del(key);
        return false;
    }
    if(data.code!==code){
        await redisClient.hIncrBy(key,"attempts",1);
        return false;
    }
    await redisClient.del(key)
    return true;
    // const result = await redisClient.eval(verifyEmailCodeScript,
    //     {
    //         keys: [key],
    //         arguments: [code]
    //     });
    // return result===1;
}