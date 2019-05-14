import { Subject } from "rxjs";

export interface LyncApiInitializer
{
    initialized:Subject<any>;
    initialize():Promise<any>;
    
}