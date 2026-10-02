import {z} from 'zod';

export const authSchema = z.object({
    userName:z.string().min(1,'用户名最少1个字符').max(12,'用户名最多12个字符')
    .superRefine((val,ctx) => {
        if(val.includes('@'))
            ctx.addIssue({message:'用户名不能包含@符号',code:'custom',path:['userName']})
    }),
    password:z.string().min(6,'密码最少6个字符').max(12,'密码最多12个字符'),
    email:z.email('请输入正确的邮箱格式'),
})

export const acccountSchema=z.string()
    .min(1,'请输入账号').superRefine((val, ctx) => {
        if(val.includes('@')){
            const email = z.email('请输入正确的邮箱格式').safeParse(val)
            if(!email.success){
                ctx.addIssue({
                    code:'custom',
                    message:'请输入正确的邮箱格式',
                    path:['account']
                })
            }
            return
        }
        if(val.length>12){
            ctx.addIssue({
                code:'custom',
                message:'账号长度小于12',
                path:['account']
            })
            return
        }
        
    })
export const authLoginSchema=z.object({
    account:acccountSchema,
    password:z.string().min(6,'密码最少6个字符').max(12,'密码最多12个字符'),
})
export type loginDto= z.infer<typeof authLoginSchema>
export type registerDto = z.infer<typeof authSchema>