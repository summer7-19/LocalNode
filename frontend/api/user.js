import request from "./requset";

// export function getUser(){
//     return request.get('/')
// }
// export function getUserById(){
//     return request.get('/:id')
// }
export function getUserMes(){
    return request.get('/user/me')
}
export function createUser(data){
    return request.post('/user',data)
}
export function updateUser(id,data){
    return request.put(`/user/${id}`,data)
}
export function deleteUser(id){
    return request.delete(`/user/${id}`)
}