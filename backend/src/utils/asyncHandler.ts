import type { Request, Response, NextFunction } from "express";

export const asyncHandler = <P = {}, ResBody = any, ReqBody = any, ReqQuery = any>(fn: (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>, next: NextFunction) => Promise<any>) => {
    return (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>, next: NextFunction) => {
        Promise.resolve(fn(req, res, next))
            .catch(next);
    }
}