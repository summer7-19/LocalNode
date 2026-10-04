import request from "./requset";

// export function getUser(){
//     return request.get('/')
// }
// export function getUserById(){
//     return request.get('/:id')
// }
export function getUserMes(){
    return request.get('/me')
}
export function createUser(data){
    return request.post('/',data)
}
export function updateUser(data){
    return request.put('/:id',data)
}
export function deleteUser(){
    return request.delete('/')
}