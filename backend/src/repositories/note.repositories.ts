import pool from "../db/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { Note,updateNoteType } from "../types/note";


export interface RowNote extends RowDataPacket {
    noteID:number,
    parentID:number,
    userID:number,
    noteName:string,
    content:string,
    updateTime:Date,
    createTime: string,
}

export const getNoteRepo  = async (id: number) => {
    const [result] = await pool.query<RowNote[]>(`select * from note where userID = ?`, [id])
    return result
}

export const getNoteRepoId  = async (id: number,userId:number) => {
    const [result] = await pool.execute<RowNote[]>(`select * from note where parentID = ? and userID =?`, [id,userId])
    return result
}

export const addNoteRepo  = async (id:number,data: Note,userId:number) => {
    // console.log(data,id)
    const [result] = await pool.execute<ResultSetHeader>(`insert into note (userID,parentID,noteName,content) values (?,?,?,?)`, [id, data.noteName, data.content,userId])
    return result
}

export const updateNoteRepo  = async (id:number,data: updateNoteType,userId:number) => {
    const [result] = await pool.execute<ResultSetHeader>(`update note set parentID = ?, noteName = ?, content = ? where noteID = ? and userID=?`, [data.parentID, data.noteName, data.content, id,userId])
    return result
}

export const deleteNoteRepo = async (id:number,userId:number) => {
    const [result] = await pool.execute<ResultSetHeader>(`delete from note where noteID = ? and userID =?`, [id,userId])
    return result
}

export const findNoteByNameRepo = async (parentID:number,noteName:string) => {
    const [result] = await pool.query(`select noteID from note where parentID =? and noteName =? `,[parentID,noteName])
    return result
}

export const existNoteRepo = async (id:number,data: updateNoteType) => {
    const [rows] = await pool.query(`select exists(select 1 from note where noteID !=?  and noteName =? and parentID = ? )`,[id,data.noteName,data.parentID])
    const result = rows as { exists:number}[]
    return result[0]?.exists === 1;
}