
export interface postKnow{
    parentID:number|null,
    knowledgeName:string,
    description:string,
}

export interface Know extends postKnow{}
export interface updateKnow{
    knowledgeName:string,
    description:string,
}