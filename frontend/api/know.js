import { da } from "element-plus/es/locale/index.mjs";
import request from "./requset";

export function getKnow(){
    return request.get('/know')
}

export function getKnowById(){
    return request.get(`/know/${id}`)
}

export function createKnow(data){
    return request.post('/know',data)
}

export function updateKnow(id,data){
    return request.put(`/know/${id}`,data)
}

export function deleteKnow(id){
    return request.post(`/know/${id}`,)
}

export function KnowTree(){
    return request.get(`/know/tree`)
}

export function getNoteByKnow(id){
    return request.get(`/know/${id}/note`)
}

export function createNoteByKnow(data){
    return request.post(`/know/${id}/note`,data)
}