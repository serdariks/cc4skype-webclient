import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { LoggingService } from "../../logging-service";
import { LyncApiPresence } from "../lync-api/lync-api-presence";
import { Person } from "../lync-api/lync-api-person";
import { WebSDKCache } from "./web-sdk-cache";

@Injectable()
export class WebSDKPresence implements LyncApiPresence{

    presenceChange= new Subject<{personId:string,presenceState:any}>();

    constructor(private loggingService:LoggingService,private cache:WebSDKCache){

    }

    private log(message:string)
    {
        this.loggingService.log(message);
    }

    private subscriptions=new Array<{person:any,subscription:any}>();

    //statusChangeBindHistory:string[]=[];

    bindPresenceListenerForPerson(person:Person){

        
        this.log(`bindPresenceListenerForPerson: invoke ${person.id}`);

        //let displayName = person.displayName();
    
       
        
        //let notBoundToStatusChangeBefore:boolean = this.statusChangeBindHistory.findIndex(s=>s==person.id())==-1;

        //if (notBoundToStatusChangeBefore) {
       
        let webSDKPerson = this.cache.persons.get(person.id);

        if(!webSDKPerson){
                   
            this.log(`bindPresenceListenerForPerson: cannot find websdk person! ${person.id}`);

            return;

        }

        webSDKPerson.status.get().then((presenceState)=> 
	    {
            //this.log('1st status retrieved for ' + uri + ' :' + presenceState);	
            this.log(`bindPresenceListenerForPerson: status.get() ${person.id}, ${presenceState}`);
            this.presenceChange.next({personId:person.id,presenceState:presenceState});            
            
        },
        (error)=>{

            this.log(`bindPresenceListenerForPerson: status.get().error ${person.id}, ${JSON.stringify(error)}`);		    
        });

        webSDKPerson.status.changed((presenceState) => {

            let uri = webSDKPerson.id();

            this.log(`bindPresenceListenerForPerson:status.changed ${uri}, ${presenceState}`);
            //this.log('status changed for ' + uri +' :' + presenceState);		    
            this.presenceChange.next({ personId: uri, presenceState: presenceState });

        });

        //this.statusChangeBindHistory.push(person.id());
        //}

        let subscription = webSDKPerson.status.subscribe();
    
        this.subscriptions.push({person:webSDKPerson,subscription:subscription});

            
    }

    unbindPresenceListenerForPerson(person:Person){

        let webSDKPerson = this.cache.persons.get(person.id);

        if(!webSDKPerson) 
        {
            this.log(`bindPresenceListenerForPerson: cannot find websdk person!${person.id}`);

            return;
        }

        let subscription = this.subscriptions.find(s=>s.person.id() == webSDKPerson.id());

        if(subscription)
        {
            this.log(`lyncapi.presence subscription found for person ${webSDKPerson.displayName()}`);

            subscription.subscription.dispose();

            this.log(`lyncapi.presence subscription disposed for person ${webSDKPerson.displayName()}`);

            this.subscriptions.splice(this.subscriptions.indexOf(subscription),1);

            this.log(`lyncapi.presence after subscription removed for person ${webSDKPerson.displayName()} ${this.subscriptions.length}`);

            this.log(`lyncapi.presence unbindPresenceListenerForPerson end.${subscription.person}`);

            /* subscription.person.status = null;            
            subscription.person = null; */

            
        }

    }

    setPresence(person:Person,status:any){

        let webSDKPerson = this.cache.persons.get(person.id);

        if(!webSDKPerson) 
        {
            this.log(`setPresence: cannot find websdk person!${person.id}`);

            return;
        }

        webSDKPerson.status(status);
    }

}