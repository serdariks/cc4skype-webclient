import { IncomingRequests } from "../messaging/incoming-requests";
import { Injectable } from "@angular/core";
import { LoggingService } from "../../logging-service";
import { Subject } from "rxjs";

@Injectable()
export class CallSessionStateChangeListener{

    stateChanged:Subject<any> = new Subject<any>();

    constructor(private incomingRequests:IncomingRequests,private logger:LoggingService){

        this.bindCallSessionStateChanged();
    }

    private bindCallSessionStateChanged(){

        this.incomingRequests.received.subscribe((obj:any)=>{
              
            if(obj.Operation == 'CallSessionStateChanged'){                               
                                
                //this.logger.log(JSON.stringify(obj));               

                this.stateChanged.next(obj.RequestData);                

            }
            
          });

    }

}