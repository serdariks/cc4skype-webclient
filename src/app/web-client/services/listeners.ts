import { IncomingRequests } from "../messaging/incoming-requests";
import { LoggingService } from "../../logging-service";
import { Injectable } from "@angular/core";
import { Listener } from "./listener";

@Injectable()
export class Listeners
{    
    constructor(private incomingRequests:IncomingRequests,private logger:LoggingService){

    }    

    createListener<T>(operationName:string):Listener<T>{

        return new Listener<T>(operationName,this.incomingRequests,this.logger);
    }

}