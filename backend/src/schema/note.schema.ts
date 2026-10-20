import { title } from 'node:process';
import z from 'zod';

export const postNoteSchema = z.object({
    title:z.string(),
    content:z.string(),
    tag:z.string(),
})
export const updateNoteSchema = z.object({
    parentId:z.number(),
    title:z.string(),
    content:z.string(),
    version:z.number(),
    tag:z.string(),
})
export type NoteDto = z.infer<typeof postNoteSchema>; 
export type updateNoteDto = z.infer<typeof updateNoteSchema>;

export const noteIDParamsSchemea=z.object({
    id:z.string().regex(/^[1-9]\d*$/,'id必须是正整数')
})