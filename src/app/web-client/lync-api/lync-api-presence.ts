import { Subject } from "rxjs";
import { Person } from "./lync-api-person";

export interface LyncApiPresence
{
    presenceChange:Subject<{personId:string,presenceState:any}>;
    bindPresenceListenerForPerson(person:Person);
    unbindPresenceListenerForPerson(person:Person);
    setPresence(person:Person,status:any);

}