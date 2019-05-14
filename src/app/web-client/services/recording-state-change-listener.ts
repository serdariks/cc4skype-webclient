import { IncomingRequests } from "../messaging/incoming-requests";
import { LoggingService } from "../../logging-service";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable()
export class RecordingStateChangeListener{

    stateChanged:Subject<{isRecording:boolean}> = new Subject<{isRecording:boolean}>();

    constructor(private incomingRequests:IncomingRequests,private logger:LoggingService){

        this.bindRecordingStateChanged();

    }

    bindRecordingStateChanged(){

        this.incomingRequests.received.subscribe((obj:any)=>{

            if(obj.Operation == 'RecordingStateChanged'){                               
                                
                //this.logger.log(JSON.stringify(obj));               

                this.stateChanged.next(obj.RequestData);                

            }

        });

    }

}