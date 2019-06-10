import { Component, OnInit, OnDestroy } from '@angular/core';
import { ContactsService } from '../../../services/contacts-service';
import { LoggingService } from '../../../../logging-service';
import { Subscription } from 'rxjs';
import { Globals } from '../../../services/globals';
import { InvokeServiceArgs } from '../../../messaging/dto/invoke-service-args';
import { ServiceCall } from '../../../messaging/service-call';
import { LyncApiGlobals } from '../../../lync-api/lync-api-globals';
import { LyncApiContainer } from '../../../lync-api/lync-api-container';
import { LyncApiAudioService } from '../../../lync-api/lync-api-audio-service';
import { LyncApiPresence } from '../../../lync-api/lync-api-presence';
import { Person } from '../../../lync-api/lync-api-person';
import { LyncApiNote } from '../../../lync-api/lync-api-note';
import { InitializeData } from '../../../services/initialize-data';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent implements OnInit,OnDestroy {

  /* @Input()contacts:any=[]; */
  contacts:ContactViewModel[]=[];
  contactPresenceMap:contactPresenceMap = {};  
  
  private lyncApiAudioService:LyncApiAudioService;
  private lyncApiPresence:LyncApiPresence;
  private lyncApiNote:LyncApiNote;
  private lyncApiGlobals:LyncApiGlobals;

  constructor(private contactsService:ContactsService,
    private loggingService:LoggingService,
    private globals:Globals,
    private logger:LoggingService,private serviceCall:ServiceCall,private apiContainer:LyncApiContainer,private initializeData:InitializeData) 
    {
      let currentApi = apiContainer.currentApi;

      this.lyncApiAudioService = currentApi.audioService;
      this.lyncApiPresence = currentApi.presence;
      this.lyncApiNote = currentApi.note;
      this.lyncApiGlobals = currentApi.globals;

  }

  private contactsSubscription:Subscription;

  ngOnInit() {       

    this.loggingService.log('ngOnInit, contacts component');

    this.bindPresenceChange();

    this.contactsSubscription = this.contactsService.contacts.subscribe((contacts:Person[])=>{

      this.unBindPresenceListenersForContacts();

      this.contacts=contacts.map(c=>{return {id:c.id,displayName:c.displayName};});

      this.bindPresenceListenersForContacts(contacts);  

      //this.getAvatars(contacts);

    });
  }

  ngOnDestroy(){

    this.loggingService.log('contacts component:ngOnDestroy, contacts component');

    this.presenceListenerSubscription.unsubscribe();

    this.loggingService.log('contacts component:ngOnDestroy, presenceListenerSubscription unsubscribed');
    
    this.unBindPresenceListenersForContacts();

    this.presenceListenerSubscription.unsubscribe();

    this.contacts.length = 0;

    this.loggingService.log('contacts component:ngOnDestroy, unBindPresenceListenersForContacts() complete');

  }

  private bindPresenceListenersForContacts(contacts:Person[]){

    contacts.forEach(contact => {      

      this.lyncApiPresence.bindPresenceListenerForPerson(contact);
      this.lyncApiNote.bindNoteListenerForPerson(contact);

      this.loggingService.log(`contacts component: presence listener bound for contact ${contact.id}`);
      
    });

  }

 /*  private getAvatars(contacts:Array<any>){
    
    contacts.forEach(contact => {      

      contact.avatarUrl.get().then((path)=>{
        contact.avatarPath = path;
      });
      
    });
  } */

  private unBindPresenceListenersForContacts(){

    this.loggingService.log(`contacts component:unBindPresenceListenersForContacts. contacts.length:${this.contacts.length}`);


    this.contacts.forEach(contact => {

      this.loggingService.log(`contacts component: presence listener will unbind for contact ${contact.id}`);

      try 
      {
        this.lyncApiPresence.unbindPresenceListenerForPerson(contact);      
      }
      catch(e)
      {
        this.loggingService.log(e);
      }

      this.loggingService.log(`contacts component: presence listener unbound for contact ${contact.id}`);
      
    });
  }

  presenceListenerSubscription:Subscription;

  

  private bindPresenceChange(){


    this.loggingService.log('contacts component:bindPresenceChange');

    this.presenceListenerSubscription = this.lyncApiPresence.presenceChange.subscribe(change=>{

       //this.contactPresenceMap[change.personId] = change.presenceState;
      
       //let contact = this.contacts.find(c=>c.personId()==change.personId);

       this.loggingService.log(`contacts component:presence will change for ${change.personId} to ${change.presenceState}`);

       let contactIndex = this.contacts.findIndex(c=>c.id==change.personId);

       if(contactIndex>-1)
       {
          let contact = this.contacts[contactIndex];

          
          let presenceItem =  this.globals.findPresenceItem(change.presenceState);

          if(presenceItem){
              contact.lastPresence = presenceItem.text;
              contact.lastPresenceItemPath = presenceItem.imagePath;
          }
          //this.contacts.splice(contactIndex,1);             
          //this.contacts.push(contact);

          this.loggingService.log(`contacts component:presence changed for ${change.personId} to ${change.presenceState}`);
       }

    });    

  }

 /*  getContactPresence(contact)
  {
     return this.contactPresenceMap[contact.personId];
  } */

  isContactCenterUri(uri:string):boolean{

    return this.initializeData.endpoints.findIndex(e=>e.EndpointSipUri == uri) > -1;
  }

  onCallPerson(contact:ContactViewModel){

    
    if(this.isContactCenterUri(contact.id)){

      this.startContactCenterCall(contact.id,nextInstance=>{
        
        this.logger.log(`contacts component: Calling instance:${nextInstance}`);

        this.lyncApiAudioService.call(nextInstance);
      });
      /* this.registerOutboundCall(()=>
      {
        this.lyncApiAudioService.call(contact.id());  
      }) */;


    }
    else
    {
      this.lyncApiAudioService.call(contact.id);
    }

  }

  private registerOutboundCall(onSuccess:()=>void){
    
    let requestData =  {originatorSip:`${this.lyncApiGlobals.clientSip}`}; 

    let args:InvokeServiceArgs={
      
      operation : "RegisterOutboundCall",
      
      requestData : requestData,
      
      responseHandler : {

        success:(result)=>{          
          
          onSuccess();
        }
        ,
        error:(err)=>{
          this.logger.log(err);
        }
  
      }
    };

    this.serviceCall.invokeService(args);

  }


  private startContactCenterCall(originalEndpointCalled:string, onSuccess:(nextInstance:string)=>void){
    
    let caller = this.lyncApiGlobals.personSignedIn;    

    let requestData =  {OriginalEndpointCalled:originalEndpointCalled,CallerUri:caller.id,CallerDisplayName:caller.displayName}; 
  
    let args:InvokeServiceArgs={
      
      targetService : "CC4Skype.ContactCenterloadBalancer",
      operation : "StartContactCenterCall",      
      requestData : requestData,

      responseHandler : {
  
        success:(result)=>{          
          
          onSuccess(result);
        }
        ,
        error:(err)=>{
          this.logger.log(err);
        }
  
      }
    };
  
    this.serviceCall.invokeService(args);
  
  }

}


export class ContactViewModel extends Person{
  lastPresenceItemPath?:string;
  lastPresence?:string;
}


interface contactPresenceMap{
  [sip:string]:string;
}


