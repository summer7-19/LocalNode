import { getNoteRepo,getNoteRepoId,addNoteRepo ,updateNoteRepo,deleteNoteRepo, findNoteByNameRepo, existNoteRepo } from "../repositories/note.repositories"
import { Note,updateNoteType } from "../types/note"
import { getKnowledgeId } from "./knowledge.services"
import { AppError } from "../errors/app.error"

export const getNote = async (id: number) => {
    const result = await getNoteRepo(id)
    return result
}

export const getNoteId = async (id: number,userId:number) => {
    const result = await getNoteRepoId(id,userId)
    return result
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
    const result = await deleteNoteRepo(id,userId)
    if(result.affectedRows===0){
        throw new AppError("删除失败",404)
    }
    return result
}