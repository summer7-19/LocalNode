import type { CreateUserDto,UpdateUserDto } from "../schema/user.schema.js";
import { getUsersRepo,getUsersReposById,createUsersRepo,updateUsersRepo,deleteUsersRepo } from "../repositories/user.repositories.js";


export const getUsersServices=()=>{
    const users= getUsersRepo;
    return users;
}

export const getUsersServicesById=async(userID:number)=>{
    const users=await getUsersReposById(userID);
    return users;
}

export const createUsersServices=async(data:CreateUserDto)=>{
    const result =await createUsersRepo(data);
    return result;
}

export const updateUsersServices=async(data:UpdateUserDto,id:number)=>{
    const result =await updateUsersRepo(data,id);
    return result;
}

export const deleteUsersServices=async(id:number)=>{
    const result =await deleteUsersRepo(id);
    return result;
}