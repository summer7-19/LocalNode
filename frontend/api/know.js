import { da } from "element-plus/es/locale/index.mjs";
import request from "./requset";

export function getKnow(){
    return request.get('/')
}

export function getKnowById(){
    return request.get('/know/:id')
}

export function createKnow(data){
    return request.post('/',data)
}

export function updateKnow(data){
    return request.put('/:id',data)
}

export function deleteKnow(){
    return request.post('/:id',)
}

export function KnowTree(){
    return request.get('/:id/tree')
}

export function getNoteByKnow(){
    return request.get('/:id/note')
}

export function createNoteByKnow(data){
    return request.post('/:id/note',data)
}