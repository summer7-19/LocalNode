import pool from "../db/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { Know,updateKnow } from "../types/know";


export interface RowKnow extends RowDataPacket {
    knowledgeID:number,
    userID:number,
    parentID:number|null,
    knowledgeName:string,
    description: string,
    createTime: string,
}

// export interface KnowIDRow extends RowDataPacket {
//     knowledgeID:number,
// }

export const getKnowledgeRepo  = async (id: number) => {
    const [result] = await pool.query<RowKnow[]>(`select * from knowledgeBase where userID = ?`, [id])
    return result
}

export const getKnowledgeRepoId  = async (id: number,userId:number) => {
    const [result] = await pool.execute<RowKnow[]>(`select * from knowledgeBase where knowledgeID = ? and userID =?`, [id,userId])
    return result[0]??null
}

export const addKnowledgeRepo  = async (data: Know,id:number) => {
    // console.log(data,id)
    const [result] = await pool.execute<ResultSetHeader>(`insert into knowledgeBase (userID,parentID,knowledgeName,description) values (?,?,?,?)`, [id, data.parentID, data.knowledgeName, data.description])
    return result
}

export const updateKnowledgeRepo  = async (id:number,parentId:number|null,data: updateKnow,userId:number) => {
    const [result] = await pool.execute<ResultSetHeader>(`update knowledgeBase set parentID = ?, knowledgeName = ?, description = ? where knowledgeID = ? and userID=?`, [parentId, data.knowledgeName, data.description, id,userId])
    return result
}

export const deleteKnowledgeRepo = async (id:number,userId:number) => {
    const [result] = await pool.execute<ResultSetHeader>(`delete from knowledgeBase where knowledgeID = ? and userID =?`, [id,userId])
    return result
}


export const findKnowledgeByNameRepo = async (name:string,userId:number,parentID:number|null) => {
    const [result] = await pool.query(`select knowledgeID from knowledgeBase where knowledgeName = ? and userID = ? and (parentID = ? or parentKey= ?`, [name,userId,parentID??0])
    return result
}


export const existKnowledgeRepo = async (id:number,parentId:number|null,data: updateKnow,userId:number) => {
    const [rows] = await pool.query(`select exists(select 1 from knowledgeBase where knowledgeID != ? and userID = ? and parentKey =? and knowledgeName = ?) `, [id,userId,parentId??0,data.knowledgeName])
    const result = rows as { exists:number}[]
    return result[0]?.exists === 1;
}