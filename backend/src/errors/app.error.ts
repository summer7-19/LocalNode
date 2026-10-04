export class AppError extends Error{
    statusCode:number;
    constructor(message:string,statusCode:number){
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, AppError.prototype); //this line is to set the prototype of the error to the prototype of the AppError class
    }
}