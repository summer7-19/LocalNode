import { z } from 'zod';

export const createUserSchema =z.object({
    userName:z.string().min(2,'用户名最少2个字符').max(12,'用户名最多12个字符'),
    password:z.string().min(6,'密码最少6个字符'),
})
// .partial()
export const updateUserSchema = createUserSchema

export const userIDParamsSchemea=z.object({
    id:z.string().regex(/^[1-9]\d*$/,'id必须是正整数')
})


export type CreateUserDto = z.infer<typeof createUserSchema>
export type UpdateUserDto = z.infer<typeof updateUserSchema>