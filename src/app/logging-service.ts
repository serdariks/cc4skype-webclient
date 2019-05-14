import { Subject } from "rxjs";

export class LoggingService{

    logGenerated = new Subject<string>();

    log(message:string)
    {
        console.log("Log from logging service:" + message);

        this.logGenerated.next(message);

    }
}