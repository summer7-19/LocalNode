
export const createEmailCode=()=>{
    return Math.floor(Math.random()*900000+100000).toString()
}