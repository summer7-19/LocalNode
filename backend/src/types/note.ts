export interface postNote{
    noteName:string,
    content:string,
}

export interface Note extends postNote{}
export interface updateNoteType {
    parentID:number,
    noteName:string,
    content:string,
}