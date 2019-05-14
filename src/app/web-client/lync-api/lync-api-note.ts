import { Subject } from "rxjs";
import { Person } from "./lync-api-person";

export interface LyncApiNote
{
    noteChange:Subject<{personId:string,note}>;
    bindNoteListenerForPerson(person:Person);
    unBindNoteListenerForPerson(person:Person);
    setNote(person:Person,note:string);

}