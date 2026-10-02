import type { Request, Response,NextFunction } from "express";
import { getUsersServices, createUsersServices, updateUsersServices, deleteUsersServices, getUsersServicesById } from "../services/user.services.js";
import type { User } from "../types/user.js"
import { CreateUserDto, UpdateUserDto } from "../schema/user.schema.js";
import { AppError } from "../errors/app.error.js";
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
export const getUsers = async (req: Request, res: Response,next: NextFunction) => {
    try {
        const rows = await getUsersServices()
        res.status(200).json(rows)
    } catch (err) {
        next(err)
    }
}

export const getUsersById = async (req: Request<{id: string}>, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id)
        const rows = await getUsersServicesById(id)
        if (rows.length === 0) {
            throw new AppError('User not found',404)
        }
        res.status(200).json(rows)
    } catch (err) {
        next(err)
    }
}
export async function getCurrentUser(req: Request,res: Response,next: NextFunction) {
  try {
    const userId = req.user?.id
    console.log(userId)
    if (!userId) {
      return res.status(401).json({
        message: '未登录'
      })
    }

    const user = await getUsersServicesById(userId)

    return res.json({
      message: '获取成功',
      data: user
    })
  } catch (error) {
    next(error)
  }
}
export const createUsers = async (req: Request<{},{},CreateUserDto>, res: Response, next: NextFunction) => {
    try {
        const data = req.body
        const result = await createUsersServices(data)
        if(result.affectedRows === 0) {
            throw new AppError('User not found',404)
        }
        res.status(201).json(result)
    } catch (err) {
        next(err)
    }
}

export const updateUsers = async (req: Request<{id:string},{},UpdateUserDto>, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id)
        const data = req.body
        const result = await updateUsersServices(data, id)
        if (result.affectedRows === 0) {
            throw new AppError('User not found',404)
        }

        res.status(201).json({
            message: "User updated successfully"
        })
    } catch (err) {
        next(err)
    }
}

export const deleteUsers = async (req: Request<{id:string}>,res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id)
        // if(!Number.isInteger(id)||id<=0) {
        //     res.status(400).json({ message: "Invalid ID" })
        //     return
        // }
        const result = await deleteUsersServices(id)
        if (result.affectedRows === 0) {
            res.status(404).json({
                message: "UserID not found"
            })
            return
        }
        res.status(200).json(result)
    } catch (err) {
        next(err)
    }
}
