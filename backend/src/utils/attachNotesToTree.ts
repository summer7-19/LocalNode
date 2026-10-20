import { getKnowledgeId } from "../services/knowledge.services";
import { KnowledgeTreeNode } from "./buildKnowledgeTree";


export interface noteNode {
    id:number,
    parentId:number,
    userID:number,
    title:string,
    content:string,
    updateTime:Date,
}

export interface noteTreeNode {
    id:number,
    parentId:number,
    title:string,
    updateTime:Date,
}

export function attachNotesToTree(tree:KnowledgeTreeNode[], notes:noteNode[]){
    const map=new Map<number,noteTreeNode[]>();

    for(const note of notes){
        const know=map.get(note.parentId)
        if(know){
            know.push(note)
        }
        else{
            map.set(note.parentId,[note])
        }
    }

    function attachNotes(nodes:KnowledgeTreeNode[]):void{
        for(const node of nodes){
            const know=map.get(node.id)
            if(know){
                node.notes.push(...know)
            }
            if(node.children.length>0){
                attachNotes(node.children)
            }
        }
    }

    attachNotes(tree)
    return tree
}