import z from 'zod';

export const postNoteSchema = z.object({
    noteName:z.string(),
    content:z.string(),
})
export const updateNoteSchema = z.object({
    parentID:z.number(),
    noteName:z.string(),
    content:z.string(),
})
export type NoteDto = z.infer<typeof postNoteSchema>; 
export type updateNoteDto = z.infer<typeof updateNoteSchema>;

export const noteIDParamsSchemea=z.object({
    id:z.string().regex(/^[1-9]\d*$/,'id必须是正整数')
})