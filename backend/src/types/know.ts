
export interface postKnow{
    parentId:number|null,
    title:string,
    description:string,
}

export interface Know extends postKnow{}
export interface updateKnow{
    title:string,
    description:string,
}