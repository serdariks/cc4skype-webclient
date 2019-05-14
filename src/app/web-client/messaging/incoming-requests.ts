import { SocketManager } from "./socket-manager";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { LoggingService } from "../../logging-service";

@Injectable()
export class IncomingRequests
{
    socket:SocketIOClient.Socket;
    /* onRequest; */ 
    
    received:Subject<any> = new Subject();

    constructor(private socketManager:SocketManager,private logger:LoggingService)
    {               
        socketManager.onInitialized.subscribe((r)=>{        
            this.socket = socketManager.socket;            
            this.bind();
        });

        socketManager.onReconnect.subscribe((r)=>{        
            this.socket = socketManager.socket;            
            this.bind();
        });
    }

    private bind()
    {
        this.socket.on('invokeService',(value)=>{
            this.logger.log('Incoming request on socket:' + this.socketManager.socketId + ' data: ' + JSON.stringify(value));	
            
            value.RequestData = JSON.parse(value.RequestData);
            /* this.onRequest(value); */
            this.received.next(value);
        });
    }

    /* initialize(onRequest)
    {
        this.onRequest = onRequest;        

    } */

}