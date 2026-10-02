import z from 'zod';

export const postKnowSchema = z.object({
    parentID:z.number().nullable().default(null),
    knowledgeName:z.string(),
    description:z.string(),
})
export const updateKnowSchema = z.object({
    // parentID:z.number().nullable().default(null),
    knowledgeName:z.string(),
    description:z.string(),
})
export type KnowDto = z.infer<typeof postKnowSchema>; 
export type updateKnowDto = z.infer<typeof updateKnowSchema>;

export const knowIDParamsSchemea=z.object({
    id:z.string().regex(/^[1-9]\d*$/,'id必须是正整数')
})