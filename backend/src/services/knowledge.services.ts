import { getKnowledgeRepo,getKnowledgeRepoId,addKnowledgeRepo ,updateKnowledgeRepo,deleteKnowledgeRepo,findKnowledgeByNameRepo, existKnowledgeRepo } from "../repositories/know.repositories"
import { getNoteRepo } from "../repositories/note.repositories"
import { Know,updateKnow } from "../types/know"
import { buildKnowledgeTree } from "../utils/buildKnowledgeTree"
import { attachNotesToTree } from "../utils/attachNotesToTree"
import { AppError } from "../errors/app.error"


export const getKnowledge = async (id: number) => {
    const result = await getKnowledgeRepo(id)
    const notes = await getNoteRepo(id)
    const tree=buildKnowledgeTree(result)
    return attachNotesToTree(tree,notes)
}

export const getKnowledgeId = async (id: number,userId:number) => {
    const result = await getKnowledgeRepoId(id,userId)
    return result
}

export const getKnowledgeTreeId = async (id: number,userId:number) => {
    const result = await getKnowledgeRepo(userId)
    if(!result){
        throw new AppError("Not Found",404)
    }
    
    const tree=buildKnowledgeTree(result,id)
    if(tree.length===0){
        throw new AppError("Not Found",404)
    }
    const notes = await getNoteRepo(userId)
    return attachNotesToTree(tree,notes)
}

export const addKnowledge = async (data: Know,userId:number) => {
    const exist=await findKnowledgeByNameRepo(data.knowledgeName,userId,data.parentID)
    if(exist){
        throw new AppError("当前知识节点下已经存在同名笔记",409)
    }
    const result= await addKnowledgeRepo(data,userId)
    return result
}

export const updateKnowledge = async (id:number,data: updateKnow,userId:number) => {
    const knowledge=await getKnowledgeRepoId(id,userId)
    if(!knowledge){
        throw new AppError("Not Found",404)
    }
    const exist=await existKnowledgeRepo(id,knowledge.parentID,data,userId)
    if(exist){
        throw new AppError("当前知识节点下已经存在同名笔记",409)
    }
    const result= await updateKnowledgeRepo(id,knowledge.parentID,data,userId)
    return result
}

export const deleteKnowledge = async (id:number,userId:number) => {
    const result = await deleteKnowledgeRepo(id,userId)
    if(result.affectedRows===0){
        throw new AppError("删除失败",404)
    }
    return result
}