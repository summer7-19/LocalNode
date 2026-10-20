export interface postNote{
    title:string,
    content:string,
    tag:string
}

export interface Note extends postNote{}
export interface updateNoteType {
    parentId:number,
    title:string,
    content:string,
    version:number,
    tag:string
}