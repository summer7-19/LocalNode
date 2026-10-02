import pool from "../db/db.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { CreateUserDto,UpdateUserDto } from "../schema/user.schema.js";
export interface UserRows extends RowDataPacket{
    userID:number,
    userName: string,
    password: string,
}
export const getUsersRepo=async()=>{
    const [users]=await pool.query<UserRows[]>("SELECT * FROM user");
    return users;
}
export const getUsersReposById=async(userID:number)=>{
    const [users]=await pool.execute<UserRows[]>("SELECT userID,userName,email FROM user WHERE userID=?",[userID]);
    return users;
}

export const createUsersRepo=async(data:CreateUserDto)=>{
    const [result] =await pool.execute<ResultSetHeader>('insert into user (userName,password) values (?,?)',[data.userName,data.password]);
    return result;
}

export const updateUsersRepo=async(data:UpdateUserDto,id:number)=>{
    const [result] =await pool.execute<ResultSetHeader>('update user set username = ? , password = ? where userID = ?',[data.userName,data.password,id])
    return result;
}

export const deleteUsersRepo=async(id:number)=>{
    const [result] =await pool.execute<ResultSetHeader>('delete from user where userID = ?',[id]);
    return result;
}