import { LoggingService } from "./logging-service";
import { Injectable, EventEmitter } from "@angular/core";


@Injectable()
export class AnotherService{

    constructor(private loggingService: LoggingService){

    }

    dataGenerated:EventEmitter<string> = new EventEmitter<string>();
    
    test(testData:string)
    {
        this.loggingService.log("This log sent by another service:" + testData);
    }

    raiseDataGenerated(data:string)
    {
        this.dataGenerated.emit(data);
    }

}