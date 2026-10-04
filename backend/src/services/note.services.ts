import { getNoteRepo,getNoteRepoId,getNoteListRepo,countNoteListRepo,addNoteRepo ,updateNoteRepo,deleteNoteRepo, findNoteByNameRepo, existNoteRepo } from "../repositories/note.repositories"
import { Note,updateNoteType } from "../types/note"
import { getKnowledgeId } from "./knowledge.services"
import { AppError } from "../errors/app.error"
import pool from "../db/db"

export const getNote = async (id: number) => {
    const result = await getNoteRepo(id)
    return result
}

export const getNoteId = async (id: number,userId:number) => {
    const result = await getNoteRepoId(id,userId)
    return result
}

export const getNoteList = async (id:number,userId: number,page:number,size:number) => {
    const know=await getKnowledgeId(id,userId)
    if(know?.length===0){
        throw new AppError("knowledge not found",404)
    }
    const offset =(page-1)*size
    const [data,total]=await Promise.all([
        getNoteListRepo(id,userId,size,offset),
        countNoteListRepo(id,userId)
    ])
    return {
        data,
        pagination:{
            page,
            size,
            total,
            totalPages:Math.ceil(Number(total)/size)
        }
    }
}

export const addNote = async (id: number,data: Note,userId:number) => {
    const knowledge=await getKnowledgeId(id,userId)
    if(!knowledge){
        throw new AppError("knowledge not found",404)
    }
    const exists= await findNoteByNameRepo(id,data.noteName)
    if(exists){
        throw new AppError("当前知识节点下已经存在同名笔记",409)
    }
    const result= await addNoteRepo(id,data,userId)
    return result
}

export const updateNote = async (id:number,data: updateNoteType,userId:number) => {
    const note=await getNoteId(id,userId)
    if(!note){
        throw new AppError("note not found",404)
    }
    const exists = await existNoteRepo(id,data)
    if(exists){
        throw new AppError("当前知识节点下已经存在同名笔记",409)
    }
    const result= await updateNoteRepo(id,data,userId)
    return result
}

export const deleteNote = async (id:number,userId:number) => {
    const connection = await pool.getConnection()
    const knowledge=await getKnowledgeId(id,userId)
    if(!knowledge){
        throw new AppError("knowledge not found",404)
    }
    const result = await deleteNoteRepo(connection,id,userId)
    if(result.affectedRows===0){
        throw new AppError("删除失败",404)
    }
    return result
}