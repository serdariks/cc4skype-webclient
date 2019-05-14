import { Injectable } from "@angular/core";
import { IncomingRequests } from "./incoming-requests";
import { ServiceCall } from "./service-call";
import { SocketManager } from "./socket-manager";
import { LoggingService } from "../../logging-service";
import { Subject } from "rxjs";

@Injectable()
export class Messaging{
    constructor(public socketManager:SocketManager,public serviceCall:ServiceCall,public incomingRequest:IncomingRequests,private logger:LoggingService){

    }
    
    initialized:Subject<any> = new Subject<any>();

    initialize(){
        
        this.socketManager.onInitialized.subscribe((r=>{    
           
      
            this.socketManager.onInitialized.unsubscribe();
      
            this.serviceCall.initialize('CC4Skype.CallCenterService');           
           
            this.incomingRequest.received.subscribe((obj:any)=>{
              
              this.logger.log(`Received incoming request from subscription:${JSON.stringify(obj)}`);
            });

            this.initialized.next();
            
      
          }));
      
          this.socketManager.initialize(); 
    }

    
}