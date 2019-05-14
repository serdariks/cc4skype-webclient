import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { LoggingService } from "../../logging-service";
import { Person } from "../lync-api/lync-api-person";
import { WebSDKCache } from "./web-sdk-cache";
import { LyncApiNote } from "../lync-api/lync-api-note";

@Injectable()
export class WebSDKNote implements LyncApiNote{

    noteChange= new Subject<{personId:string,note:string}>();

    constructor(private loggingService:LoggingService,private cache:WebSDKCache){

    }

    private log(message:string)
    {
        this.loggingService.log(message);
    }

    private subscriptions=new Array<{person:any,subscription:any}>();

    bindNoteListenerForPerson(person:Person){

        
        this.log(`bindNoteListenerForPerson: invoke ${person.id}`);        
       
        let webSDKPerson = this.cache.persons.get(person.id);

        if(!webSDKPerson){
                   
            this.log(`bindNoteListenerForPerson: cannot find websdk person! ${person.id}`);

            return;

        }
        
        webSDKPerson.note.text.get().then((note)=> 
	    {            
            this.log(`bindNoteListenerForPerson: status.get() ${person.id}, ${note}`);
            this.noteChange.next({personId:person.id,note:note});            
            
        },
        (error)=>{

            this.log(`bindNoteListenerForPerson: status.get().error ${person.id}, ${JSON.stringify(error)}`);		    
        });

        webSDKPerson.note.text.changed((note) => {

            let uri = webSDKPerson.id();

            this.log(`bindNoteListenerForPerson:status.changed ${uri}, ${note}`);
         
            this.noteChange.next({ personId: uri, note: note });

        });
        
        let subscription = webSDKPerson.note.text.subscribe();
    
        this.subscriptions.push({person:webSDKPerson,subscription:subscription});

            
    }

    unBindNoteListenerForPerson(person:Person){

        let webSDKPerson = this.cache.persons.get(person.id);

        if(!webSDKPerson) 
        {
            this.log(`bindNoteListenerForPerson: cannot find websdk person!${person.id}`);

            return;
        }

        let subscription = this.subscriptions.find(s=>s.person.id() == webSDKPerson.id());

        if(subscription)
        {
            this.log(`lyncapi.Note subscription found for person ${webSDKPerson.displayName()}`);

            subscription.subscription.dispose();

            this.log(`lyncapi.Note subscription disposed for person ${webSDKPerson.displayName()}`);

            this.subscriptions.splice(this.subscriptions.indexOf(subscription),1);

            this.log(`lyncapi.Note after subscription removed for person ${webSDKPerson.displayName()} ${this.subscriptions.length}`);

            this.log(`lyncapi.Note unbindNoteListenerForPerson end.${subscription.person}`);

            /* subscription.person.status = null;            
            subscription.person = null; */

            
        }

    }

    setNote(person:Person,note:string){

        let webSDKPerson = this.cache.persons.get(person.id);

        if(!webSDKPerson) 
        {
            this.log(`setNote: cannot find websdk person!${person.id}`);

            return;
        }

        webSDKPerson.note.text.set(note);
        
    }

}