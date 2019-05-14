import { Injectable } from "@angular/core";
import { InvokeServiceArgs } from "./dto/invoke-service-args";
import { SocketManager } from "./socket-manager";
import { ResponseHandler } from "./response-handler";

@Injectable()
export class ServiceCall
{
    socket:SocketIOClient.Socket;
    handlers:ResponseHandlers = {};
    handlersCounter:number = 0;
    defaultTargetService:string;

    constructor(private socketManager:SocketManager)
    {
        this.socketManager.onInitialized.subscribe((r)=>{
            this.socket = this.socketManager.socket;
            this.bindInvokeServiceResult();
        });

        this.socketManager.onReconnect.subscribe((r)=>{
            this.socket = this.socketManager.socket;
            this.bindInvokeServiceResult();
        });
    }

    initialize(defaultTargetService:string)
    {
        this.defaultTargetService = defaultTargetService;                
    }

    private bindInvokeServiceResult() {

        this.socket.on('invokeServiceResult', (value) => {

            console.log('invokeServiceResult: ' + JSON.stringify(value));

            let responseHandler = this.handlers[value.UniqueRequestId];
            delete this.handlers[value.UniqueRequestId];

            if (responseHandler) {
                //console.log('a response handler has been found');

                if (value.Error && value.Error != '') 
                {
                    responseHandler.error(value.Error);
                } 
                else 
                {
                    try
                    {
                        let resp = JSON.parse(value.ResponseData);
                        responseHandler.success(resp);

                    }
                    catch(error)
                    {
                        responseHandler.error(error);
                    }
                    
                }

                console.log('responseHandler invoked');

            }

        });
    }

    invokeService(args:InvokeServiceArgs)
    {
        let operation = args.operation;
	    let requestData = args.requestData;
        let responseHandler = args.responseHandler;

        let targetRooms = args.targetRooms;
        let targetService = args.targetService;        

        //a request may contain both target rooms and target service
        
        if(!targetRooms && !targetService){ //if none of them present then use the default target service
            targetService = this.defaultTargetService;
        }

        //targetService = args.targetService ? args.targetService : this.defaultTargetService;

	    this.handlersCounter++;

	    this.handlers[this.handlersCounter + ''] = responseHandler;

	    let serviceCallPackage = 	
		{            
            Target:targetService,
            TargetRooms:targetRooms,
            operation:operation,            
			requestData: requestData ? JSON.stringify(requestData) : undefined ,
			uniqueRequestId:this.handlersCounter
		};

	    console.log('serviceCallPackage: ' + JSON.stringify(serviceCallPackage));

	    this.socket.emit('invokeService',serviceCallPackage);
    }

}

interface ResponseHandlers
{
    [key:string]:ResponseHandler
}



