import pool from "../db/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { Note,updateNoteType } from "../types/note";
import { PoolConnection } from "mysql2/promise";

export interface RowNote extends RowDataPacket {
    noteID:number,
    parentID:number,
    userID:number,
    noteName:string,
    version:number,
    content:string,
    updateTime:Date,
    createTime: string,
}

export const getNoteRepo  = async (userId: number) => {
    const [result] = await pool.query<RowNote[]>(`select n.noteID,n.noteName,n.content,n.createTime,n.updateTime from note as n join knowledgeBase as k on n.parentID = k.knowledgeID  where k.userID = ?`, [userId])
    return result
}

export const getNoteRepoId  = async (id: number,userId:number) => {
    const [result] = await pool.execute<RowNote[]>(`select n.noteID,n.noteName,n.content,n.createTime,n.updateTime from note as n join knowledgeBase as k on n.parentID = k.knowledgeID where n.parentID = ? and k.userID =?`, [id,userId])
    return result
}

export const getNoteListRepo  = async (id: number,userId:number,size:number,offset:number) => {
    const [result] = await pool.execute<RowNote[]>(`select n.noteID,n.noteName,n.content,n.createTime,n.updateTime from note as n join knowledgeBase as k on n.parentID = k.knowledgeID where n.parentID = ? and k.userID=?  limit ? offset ?`, [id,userId,size,offset])
    return result
}

export const countNoteListRepo  = async (id: number,userId:number) => {
    const [rows] = await pool.query(`select count(*) as total from note as n join knowledgeBase as k on n.parentID = k.knowledgeID where n.parentID = ? and k.userID=?`, [id,userId])
    const result=rows as {total:number}[]
    return result[0]?.total
}

export const addNoteRepo  = async (id:number,data: Note,userId:number) => {
    // console.log(data,id)
    const [result] = await pool.execute<ResultSetHeader>(`insert into note (parentID,noteName,content) values (?,?,?)`, [id,data.noteName, data.content])
    return result
}

export const updateNoteRepo  = async (id:number,data: updateNoteType,userId:number) => {
    console.log(data.version,id)
    const [result] = await pool.execute<ResultSetHeader>(`update note as n join knowledgeBase as k on n.parentID=k.knowledgeID set n.parentID = ?, n.noteName = ?, n.content = ? , n.version=n.version+1 ,n.updateTime=NOW() where n.noteID = ? and k.userID=? and n.version = ?`, [data.parentID, data.noteName, data.content, id,userId,data.version??1])
    
    return result
}

export const deleteNoteRepo = async (id:number,userId:number) => {
    const [result] = await pool.execute<ResultSetHeader>(`delete from note as n join knowledgeBase as k on n.parentID=k.knowledgeID where n.noteID = ? and k.userID =?`, [id,userId])
    return result
}

export const deleteAllNoteRepo = async (connection: PoolConnection,id:number,userId:number) => {
    const [result] = await connection.execute<ResultSetHeader>(`delete from note as n join knowledgeBase as k on n.parentID=k.knowledgeID where n.parentID = ? and k.userID =?`, [id,userId])
    return result
}

export const findNoteByNameRepo = async (parentID:number,noteName:string) => {
    const [result] = await pool.query(`select n.noteID from note as n join knowledgeBase as k on n.parentID=k.knowledgeID  where n.parentID =? and n.noteName =? `,[parentID,noteName])
    return result
}

export const existNoteRepo = async (id:number,data: updateNoteType) => {
    const [rows] = await pool.query(`select exists(select 1 from note as n join knowledgeBase as k on n.parentID=k.knowledgeID  where n.noteID <>?  and n.noteName =? and n.parentID = ? )`,[id,data.noteName,data.parentID])
    const result = rows as { exists:number}[]
    return result[0]?.exists === 1;
}