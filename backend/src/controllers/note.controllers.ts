import type { Request, Response } from 'express';
import { getNote,getNoteId, addNote,updateNote, deleteNote } from '../services/note.services';
import { Note,updateNoteType } from '../types/note';
import { AppError } from '../errors/app.error';

export const getNoteController = async (req: Request, res: Response) => {
    const id=req.user?.id
    if(!id){
        throw new AppError('未登录',401)
    }
    const result=await getNote(id)
    res.status(200).json(result)
}

export const getNoteIdController = async (req: Request<{id:string}>, res: Response) => {
    const id=Number(req.params.id)
    const userId=req.user?.id
    const result=await getNoteId(id,userId)
    if(result.length===0){
        throw new AppError('没有笔记',404)
    }
    res.status(200).json(result)
}

export const createNoteController = async (req: Request<{id:string},{},Note>, res: Response) => {
    const userId=req.user?.id
    const data=req.body
    const id=Number(req.params.id)
    const result=await addNote(id,data,userId)
    if(result.affectedRows===0){
        throw new AppError('创建笔记失败',404)
    }
    res.status(200).json(result)
}


export const updateNoteController = async (req: Request<{id:string},{},updateNoteType>, res: Response) => {
    const id=Number(req.params.id)
    const data=req.body
    const userId=req.user?.id
    const result=await updateNote(id,data,userId)
    if(result.affectedRows===0){
        throw new AppError('更新笔记失败',404)
    }
    res.status(200).json(result)
}

export const deleteNoteController = async (req: Request<{id:string}>, res: Response) => {
    const id=Number(req.params.id)
    const userId=req.user?.id
    const result=await deleteNote(id,userId)
    if(result.affectedRows===0){
        throw new AppError('删除笔记失败',404)
    }
    res.status(200).json(result)
}