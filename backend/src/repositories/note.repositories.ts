import pool from "../db/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { Note,updateNoteType } from "../types/note";
import { PoolConnection } from "mysql2/promise";

export interface RowNote extends RowDataPacket {
    id:number,
    parentId:number,
    userID:number,
    title:string,
    version:number,
    content:string,
    updateTime:Date,
    createTime: string,
}

export const getNoteRepo  = async (userId: number) => {
    const [result] = await pool.query<RowNote[]>(`select n.noteID as id,n.noteName as title,n.content,n.parentID as parentId,n.version,n.tag,n.createTime,n.updateTime from note as n join knowledgeBase as k on n.parentID = k.knowledgeID  where k.userID = ?`, [userId])
    return result
}

export const getNoteRepoId  = async (id: number,userId:number) => {
    const [result] = await pool.execute<RowNote[]>(`select n.noteID as id,n.noteName as title,n.content,n.parentID as parentId,n.version,n.tag,n.createTime,n.updateTime from note as n join knowledgeBase as k on n.parentID = k.knowledgeID where n.noteID= ? and k.userID =?`, [id,userId])
    return result
}

export const getNoteListRepo  = async (id: number,userId:number,size:number,offset:number) => {
    const [result] = await pool.execute<RowNote[]>(`select n.noteID as id,n.noteName as title,n.content,n.parentID as parentId,n.version,n.tag,n.createTime,n.updateTime from note as n join knowledgeBase as k on n.parentID = k.knowledgeID where n.parentID = ? and k.userID=?  limit ? offset ?`, [id,userId,size,offset])
    return result
}

export const countNoteListRepo  = async (id: number,userId:number) => {
    const [rows] = await pool.query(`select count(*) as total from note as n join knowledgeBase as k on n.parentID = k.knowledgeID where n.parentID = ? and k.userID=?`, [id,userId])
    const result=rows as {total:number}[]
    return result[0]?.total
}

export const addNoteRepo  = async (id:number,data: Note,userId:number) => {
    // console.log(data,id)
    const [result] = await pool.execute<ResultSetHeader>(`insert into note (parentID,noteName,content,tag) values (?,?,?,?)`, [id,data.title, data.content,data.tag])
    return result
}

export const updateNoteRepo  = async (id:number,data: updateNoteType,userId:number) => {
    console.log(data.version,id)
    const [result] = await pool.execute<ResultSetHeader>(`update note as n join knowledgeBase as k on n.parentID=k.knowledgeID set n.parentID = ?, n.noteName = ?, n.content = ? , n.version=n.version+1,n.tag=? ,n.updateTime=NOW() where n.noteID = ? and k.userID=? and n.version = ?`, [data.parentId, data.title, data.content,data.tag, id,userId,data.version??1])
    
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
    const [rows] = await pool.query(`select exists(select 1 from note as n join knowledgeBase as k on n.parentID=k.knowledgeID  where n.noteID <>?  and n.noteName =? and n.parentID = ? )`,[id,data.title,data.parentId])
    const result = rows as { exists:number}[]
    return result[0]?.exists === 1;
}

export const searchRepo = async (search: string, userId: number) => {
  const keyword = `%${search}%`;
  const query = `
    SELECT 'note' AS type, n.noteID AS id, n.noteName AS title,
           n.content AS content, n.tag AS tag, n.parentID AS parentId,
           n.updateTime AS updateTime, k.knowledgeName AS folderTitle
    FROM note AS n
    JOIN knowledgeBase AS k ON n.parentID = k.knowledgeID
    WHERE k.userID = ? AND (
      LOWER(n.noteName) LIKE LOWER(?)
      OR LOWER(n.content) LIKE LOWER(?)
      OR LOWER(n.tag) LIKE LOWER(?)
      OR LOWER(k.description) LIKE LOWER(?)
    )
    UNION ALL
    SELECT 'folder' AS type, k.knowledgeID AS id, k.knowledgeName AS title,
           k.description AS content, NULL AS tag, k.parentID AS parentId,
           k.createTime AS updateTime, NULL AS folderTitle
    FROM knowledgeBase AS k
    WHERE k.userID = ? AND (
      LOWER(k.knowledgeName) LIKE LOWER(?)
      OR LOWER(k.description) LIKE LOWER(?)
    )
    ORDER BY updateTime DESC
    LIMIT 10
  `;
  const [result] = await pool.query(query, [
    userId, keyword, keyword, keyword, keyword,
    userId, keyword, keyword
  ]);
  return result;
}