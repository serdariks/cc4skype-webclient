import { Subject } from "rxjs";
import { Person } from "./lync-api-person";

export interface LyncApiAudioService{
    
    callStateChanged:Subject<{state:any,person1:Person,person2:Person}>;

    call(targetUri:string);
    registerIncomingAudio();
    acceptCall():Promise<any>;
    rejectCall():Promise<any>;
    hangUp():Promise<any>;
    joinMeeting(meetingUrl:string);
    sendDTMF(tone:string); 
    hasActiveCall():boolean;   
}