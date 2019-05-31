import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable()
/* A timer for counting the duration of current call in the current state */
export class CallSessionTimer {
    /* timerElemjQuery - Will update the value of all DOM elements returned by this jquery to current timer value
     * startElemJQuery - Will update the value of all DOM elements returned by this jquery to timer start time
     * refreshInterval - the timer periodicity */
    _start:Date;
    _handle:number;
    _duration:number;
    _refreshInterval:number;

    onIntervalTick:Subject<string> ;

    constructor() {
        this._start = null;
        //this._timerElemjQuery = timerElemJQuery;
        //this.refreshInterval = refreshInterval;
        this._handle = null;
        //this._startElemjQuery = startElemJQuery;
        this._duration = 0;
    }
    get refreshInterval() {
        return this._refreshInterval;
    }
    set refreshInterval(value) {
        this._refreshInterval = value;
    }
    /* Stop the timer with value frozen at current instance */
    stop() {
        if (this._handle) {
            window.clearInterval(this._handle);
            this._handle = null;
        }
    }
    /* Stop the timer and reset it to zero */
    reset():Promise<void> {

        return new Promise<void>((resolve,reject)=>{

            this.stop();
            //$(this._timerElemjQuery).text("00");
        
            this._start = null;
            this._duration = 0;

        });
        
    }
    get startTime() {
        return this._start;
    }
    get duration() {
        return this._duration;
    }

    init(refreshInterval:number){
        this.refreshInterval = refreshInterval;
    }
    start() {        
        

        if (this._start) {
            this.stop();
        }
        this._start = new Date();
                
        this._handle = window.setInterval(()=>{            
            this.onIntervalTick.next(this.getTimeString());

        }, this.refreshInterval);
    }

    getStartTimeString(){
        return this._start.toLocaleTimeString();
    }
    getTimeString():string
    {
        var now = new Date().getTime();
            var secs = (now - this._start.getTime()) / 1000;
            this._duration = secs;
            var hrs = Math.floor(secs / 3600);
            secs = secs % 3600;
            var mins = Math.floor(secs / 60);
            secs = Math.floor(secs % 60);
            var timeStr = hrs + ":" + mins + ":" + secs;

        return timeStr;
         
    }
    
};
