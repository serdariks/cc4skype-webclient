import { LoggingService } from "../../logging-service";
import { Injectable } from "@angular/core";

@Injectable()
export class CacheService{

    logs:string[] = [];

    constructor(private loggingService:LoggingService){

    }

    initialize(){
        this.subscribeToLogs();
    }

    subscribeToLogs(){

        this.loggingService.logGenerated.subscribe((message:string)=>
        {
            this.logs.push(message);               
    
        });

    }
}