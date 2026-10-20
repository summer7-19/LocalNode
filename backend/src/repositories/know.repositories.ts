import pool from "../db/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { Know,updateKnow } from "../types/know";
import { PoolConnection } from "mysql2/promise";

export interface RowKnow extends RowDataPacket {
    id:number,
    userID:number,
    parentKey:number,
    parentId:number|null,
    title:string,
    description: string,
    createTime: string,
}

// export interface KnowIDRow extends RowDataPacket {
//     knowledgeID:number,
// }

export const getKnowledgeRepo  = async (id: number) => {
    const [result] = await pool.query<RowKnow[]>(`select k.knowledgeID as id,k.knowledgeName as title ,k.description,k.parentID as parentId,k.createTime from knowledgeBase as k where userID = ?`, [id])
    return result
}

export const getKnowledgeRepoId  = async (id: number,userId:number) => {
    const [result] = await pool.execute<RowKnow[]>(`select k.knowledgeID as id,k.knowledgeName as title ,k.description,k.parentID as parentId ,k.createTime from knowledgeBase as k where knowledgeID = ? and userID =?`, [id,userId])
    return result[0]??null
}

export const addKnowledgeRepo  = async (data: Know,id:number) => {
    // console.log(data,id)
    const [result] = await pool.execute<ResultSetHeader>(`insert into knowledgeBase (userID,parentID,knowledgeName,description) values (?,?,?,?)`, [id, data.parentId, data.title, data.description])
    return result
}

export const updateKnowledgeRepo  = async (id:number,parentId:number|null,data: updateKnow,userId:number) => {
    const [result] = await pool.execute<ResultSetHeader>(`update knowledgeBase set parentID = ?, knowledgeName = ?, description = ? where knowledgeID = ? and userID=?`, [parentId, data.title, data.description, id,userId])
    return result
}

export const deleteKnowledgeRepo = async (connection:PoolConnection,id:number,userId:number) => {
    const [result] = await connection.execute<ResultSetHeader>(`delete from knowledgeBase where knowledgeID = ? and userID =?`, [id,userId])
    return result
}


export const findKnowledgeByNameRepo = async (name:string,userId:number,parentID:number|null) => {
    const [result] = await pool.query(`select knowledgeID from knowledgeBase where knowledgeName = ? and userID = ? and (parentID = ? or parentKey= ?)`, [name,userId,parentID??0])
    return result
}


export const existKnowledgeRepo = async (id:number,parentId:number|null,data: updateKnow,userId:number) => {
    const [rows] = await pool.query(`select exists(select 1 from knowledgeBase where knowledgeID <> ? and userID = ? and parentKey =? and knowledgeName = ?) `, [id,userId,parentId??0,data.title])
    const result = rows as { exists:number}[]
    return result[0]?.exists === 1;
}