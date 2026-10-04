import { Request } from "express";

export interface ValidateRequest <P={},B={},Q={}> extends Request<P,any,B,Q>{
    validated: {
        params: P;
        body: B;
        query: Q;
    }
}