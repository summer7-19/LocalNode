import type { Request, Response } from 'express';
import { getKnowledge,getKnowledgeId,getKnowledgeTreeId, addKnowledge,updateKnowledge, deleteKnowledge } from '../services/knowledge.services';
import { KnowDto,updateKnowDto } from '../schema/know.schema';
import { AppError } from '../errors/app.error';

export const getKnowledgeController = async (req: Request, res: Response) => {
    const id=req.user?.id
    if(!id){
        throw new AppError('未登录',401)
    }
    const result=await getKnowledge(id)
    res.status(200).json(result)
}

export const getKnowledgeIdController = async (req: Request<{id:string}>, res: Response) => {
    const id=Number(req.params.id)
    const userId=req.user?.id
    const result=await getKnowledgeId(id,userId)
    if(result?.length===0){
        throw new AppError('没有知识库',404)
    }
    res.status(200).json(result)
}

export const getKnowTreeController = async (req: Request<{id:string}>, res: Response) => {
    const id=Number(req.params.id)
    const userId=req.user?.id
    const result=await getKnowledgeTreeId(id,userId)
    if(result.length===0){
        throw new AppError('没有知识库',404)
    }
    res.status(200).json(result)
}

export const createKnowledgeController = async (req: Request<{},{},KnowDto>, res: Response) => {
    const id=req.user?.id
    const data=req.body
    const result=await addKnowledge(data,id)
    if(result.affectedRows===0){
        throw new AppError('创建知识库失败',404)
    }
    res.status(200).json(result)
}


export const updateKnowledgeController = async (req: Request<{id:string},{},updateKnowDto>, res: Response) => {
    const id=Number(req.params.id)
    const data=req.body
    const userId=req.user?.id
    const result=await updateKnowledge(id,data,userId)
    if(result.affectedRows===0){
        throw new AppError('更新知识库失败',404)
    }
    res.status(200).json(result)
}

export const deleteKnowledgeController = async (req: Request<{id:string}>, res: Response) => {
    const id=Number(req.params.id)
    const userId=req.user?.id
    const result=await deleteKnowledge(id,userId)
    if(result.affectedRows===0){
        throw new AppError('删除知识库失败',404)
    }
    res.status(200).json(result)
}