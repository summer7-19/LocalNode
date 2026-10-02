import { getKnowledgeId } from "../services/knowledge.services";
import { KnowledgeTreeNode } from "./buildKnowledgeTree";


export interface noteNode {
    noteID:number,
    parentID:number,
    userID:number,
    noteName:string,
    content:string,
    updateTime:Date,
}

export interface noteTreeNode {
    noteID:number,
    parentID:number,
    noteName:string,
    updateTime:Date,
}

export function attachNotesToTree(tree:KnowledgeTreeNode[], notes:noteNode[]){
    const map=new Map<number,noteTreeNode[]>();

    for(const note of notes){
        const know=map.get(note.parentID)
        if(know){
            know.push(note)
        }
        else{
            map.set(note.parentID,[note])
        }
    }

    function attachNotes(nodes:KnowledgeTreeNode[]):void{
        for(const node of nodes){
            const know=map.get(node.knowledgeID)
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