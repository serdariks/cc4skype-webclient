import { IncomingRequests } from "../messaging/incoming-requests";
import { LoggingService } from "../../logging-service";
import { Subject } from "rxjs";

export class Listener<T>
{    
    received:Subject<T> = new Subject<T>();

    constructor(private operationName:string,private incomingRequests:IncomingRequests,private logger:LoggingService){
        this.bind();
    }

    private bind(){

        this.incomingRequests.received.subscribe(obj=>{

            if(obj.Operation == this.operationName){                               
                                
                //this.logger.log(JSON.stringify(obj));               

                this.received.next(obj.RequestData);                

            }

        });
    }

    
}