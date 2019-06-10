import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({providedIn:"root"})
export class LastPhoneCallActivityService{
    
    private _lastPhoneCallActivity:LastPhoneCallActivity;

    get lastPhoneCallActivity():LastPhoneCallActivity{
        return this._lastPhoneCallActivity;
    } 

    Changed:Subject<LastPhoneCallActivity> = new Subject<LastPhoneCallActivity>();      
    
    setLastPhoneCallActivity(lastPhoneCallActivity:LastPhoneCallActivity){
        this._lastPhoneCallActivity = lastPhoneCallActivity;
        this.Changed.next(this.lastPhoneCallActivity);
    }

}

export class LastPhoneCallActivity{
    constructor(public activityId:string,public activityDescription:string){

    }
}