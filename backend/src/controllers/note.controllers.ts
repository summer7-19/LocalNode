import type { Request, Response } from 'express';
import { getNote,getNoteId,getNoteList, addNote,updateNote, deleteNote,searchService } from '../services/note.services';
import { Note,updateNoteType } from '../types/note';
import { AppError } from '../errors/app.error';
import {asyncHandler} from '../utils/asyncHandler';


export const getNoteController = asyncHandler(async (req: Request, res: Response) => {
    const userId=req.user!.id
    if(!userId){
        throw new AppError('未登录',401)
    }
    const result=await getNote(userId)
    res.status(200).json(result)
})

export const getNoteIdController = asyncHandler(async (req: Request<{id:string}>, res: Response) => {
    const id=Number(req.params.id)
    const userId=req.user!.id
    const result=await getNoteId(id,userId)
    if(result.length===0){
        throw new AppError('没有笔记',404)
    }
    res.status(200).json(result)
})

export const getNoteListController =asyncHandler(async (req: Request<{id:string},{},Note,{page:string,pageSize:string}>, res: Response) => {
    const userId=req.user!.id
    const id=Number(req.params.id)
    const {page,size}=req.validated!.query as {
        page:number,
        size:number
    }
    const result=await getNoteList(id,userId,page,size)
    res.status(200).json(result)
})

export const createNoteController = asyncHandler(async (req: Request<{id:string},{},Note>, res: Response) => {
    const userId=req.user!.id
    const data=req.body
    const id=Number(req.params.id)
    const result=await addNote(id,data,userId)
    if(result.affectedRows===0){
        throw new AppError('创建笔记失败',404)
    }
    res.status(201).send({
      message: "创建成功",
      data: result
    })
})


export const updateNoteController = asyncHandler(async (req: Request<{id:string},{},updateNoteType>, res: Response) => {
    const id=Number(req.params.id)
    const data=req.body
    const userId=req.user!.id
    const result=await updateNote(id,data,userId)
    console.log(result)
    if(result.affectedRows===0){
        throw new AppError('更新笔记失败',404)
    }
    res.status(200).json(result)
})

export const deleteNoteController = asyncHandler(async (req: Request<{id:string}>, res: Response) => {
    const id=Number(req.params.id)
    const userId=req.user!.id
    const result=await deleteNote(id,userId)
    if(result.affectedRows===0){
        throw new AppError('删除笔记失败',404)
    }
    res.status(200).json(result)
})

export const searchController = asyncHandler(async (req: Request, res: Response) => {
    const userId=req.user!.id
    if(!userId){
        res.json(401).json({message:'用户未登录'})
    }
    const {search}  = req.body
    const result=await searchService(search,userId)
    res.status(200).json(result)
})