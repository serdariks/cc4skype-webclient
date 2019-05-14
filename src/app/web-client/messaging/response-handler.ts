export interface ResponseHandler{
    success:(response:any)=>void;
    error:(error:any)=>void;
}