import { ResponseHandler } from "../response-handler";

export class InvokeServiceArgs{

    operation:string;
    requestData:any;
    responseHandler:ResponseHandler;
    targetService?:string;
    targetRooms?:string[];

}