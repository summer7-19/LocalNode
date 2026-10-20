import request from "./requset";


const url='/emailCode'
export function sendEmailCode(data){
    console.log(data)
    return request.post(`${url}/send`,data)
}

export function verifyEmailCode(data){
    return request.post(`${url}/varify`,data)
}