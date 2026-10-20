import request from "./requset";

export function getNote(){
    return request.get('/note')
}

export function getNoteById(id){
    return request.get(`/note/${id}`)
}

export function updateNote(id,data){
    return request.put(`/note/${id}`,data)
}

export function deleteNote(id){
    return request.delete(`/note/${id}`)
}

export function searchNote(key){
    return request.post('/note/search',{
        search:key
    })
}