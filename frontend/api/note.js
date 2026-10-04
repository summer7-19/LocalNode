import request from "./requset";

export function getNote(){
    return request.get('/')
}

export function getNoteById(){
    return request.get('/:id')
}

export function updateNote(){
    return request.put('/:id')
}

export function deleteNote(){
    return request.delete('/:id')
}