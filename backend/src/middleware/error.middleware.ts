import type {Request, Response, NextFunction} from 'express';
import { AppError } from '../errors/app.error';

export const errorMiddleware = (error: unknown, req: Request, res: Response, next: NextFunction) => {
     console.log(error);
    if(error instanceof AppError){
        res.status(error.statusCode).json({
            message: error.message
        })
        return 
    }
    res.status(500).json({
        message:'服务器错误'
    })
}