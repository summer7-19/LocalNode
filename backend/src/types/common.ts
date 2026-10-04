export interface PageResult<T>{
    data: T[];
    pagination:{
        page: number;
        size: number;
        total: number;
        totalPages: number;
    }
}