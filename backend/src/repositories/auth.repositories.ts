import pool from "../db/db"
import { ResultSetHeader,RowDataPacket } from "mysql2"
import type{registerDto, loginDto} from "../schema/auth.schema"
import bcrypt from "bcrypt"

export const RegisterRepo=async(data:registerDto)=>{
    const password = await bcrypt.hash(data.password,10)
    const [result] = await pool.execute<ResultSetHeader>('insert into user ( userName,password,email) values (?,?,?)',[data.userName,password,data.email])
    return result
}

export const LoginRepo=async(data:loginDto)=>{
    const [result] = await pool.execute('select * from user where userName=? OR email=?',[data.account,data.account])
    return result
}