import { Component, OnInit } from '@angular/core';
import { InvokeServiceArgs } from '../../messaging/dto/invoke-service-args';
import { ServiceCall } from '../../messaging/service-call';
import { LoggingService } from '../../../logging-service';
import { CallSessionRequests } from '../../services/call-session-requests';
import { LyncApiContainer } from '../../lync-api/lync-api-container';
import { LyncApiAudioService } from '../../lync-api/lync-api-audio-service';
import { LyncApiPresence } from '../../lync-api/lync-api-presence';
import { Subscription } from 'rxjs';
import { Globals } from '../../services/globals';
import { CallViewStateMachine } from '../call-center-call-view/call-view-state-machine';
import { StateName } from '../call-center-call-view/enums';
import { LyncApiGlobals } from '../../lync-api/lync-api-globals';
import { CallSessionStateChangeListener } from '../../services/call-session-state-change-listener';
import { LyncApiContacts } from '../../lync-api/lync-api-contacts';
import { Person } from '../../lync-api/lync-api-person';
import { LyncApiNote } from '../../lync-api/lync-api-note';
import { OutBoundCallStateMachine, OutBoundCallStateName } from '../component-base/outbound-call-state-machine';
import { Listeners } from '../../services/listeners';
import { Listener } from '../../services/listener';
import { UserInitializeData, UserData, Roles, UserRole } from '../../services/user-initialize-data';

@Component({
  selector: 'app-contact-search',
  templateUrl: './contact-search.component.html',
  styleUrls: ['./contact-search.component.css']
})
export class ContactSearchComponent implements OnInit {

  private lyncApiAudioService:LyncApiAudioService;
  private lyncApiPresence:LyncApiPresence;
  private lyncApiNote:LyncApiNote;
  private lyncApiGlobals:LyncApiGlobals;
  private lyncApiContacts:LyncApiContacts;

  constructor(private serviceCall:ServiceCall,private logger:LoggingService,private callSessionRequests:CallSessionRequests,
    private apiContainer:LyncApiContainer,private globals:Globals,private callViewStateMachine:CallViewStateMachine,
    private callSessionStateChangeListener:CallSessionStateChangeListener,private outboundCallStateMachine:OutBoundCallStateMachine,
    private listeners:Listeners,private userInitializeData:UserInitializeData) 
  {
    this.lyncApiAudioService = apiContainer.currentApi.audioService;
    this.lyncApiPresence = apiContainer.currentApi.presence;
    this.lyncApiNote = apiContainer.currentApi.note;
    this.lyncApiGlobals = apiContainer.currentApi.globals;
    this.lyncApiContacts = apiContainer.currentApi.contactsService;

    this.outboundCallMessagesListener = this.listeners.createListener<any>('PublishOutBoundCallMessage');       

    this.userData = userInitializeData.userData;
    this.roles = this.userData.roles;

  }

  userData:UserData;
  roles:Roles;

  private outboundCallMessagesListener:Listener<any>;

  resultList:any[] = [];

  warmTransferIconPath:string = 'assets/img/cc4s/Warm_transfer_small.png';
  coldTransferIconPath:string = 'assets/img/cc4s/Cold_transfer_small.png';  
  personalParkIconPath:string = 'assets/img/cc4s/Park_small.png';

  ngOnInit() {    
    this.bindPresenceChange();
    this.bindNoteChange();
    this.bindCallViewStateChanged();
    this.bindOutBoundCallStateChanged();
    this.bindCallSessionStateChanged();
    this.bindOutBoundCallMessagesListener();
    this.onSearch('');

    let cccc = this.isOperator;
  }

  onSearch(searchInput:string){
    
    let keepOldResultList = this.resultList;

    this.resultList = [];    
    
    let requestData =  {Keyword:searchInput} 

    let args:InvokeServiceArgs={
      
      operation : "FilterContactsViaLucene",
      
      requestData : requestData,
      
      responseHandler : {

        success:(result)=>{        
  
          this.logger.log('FilterContactsViaLucene response received: ' + JSON.stringify(result));
          

          this.unBindPresenceListenersForContacts(keepOldResultList);

          this.resultList = (<any[]>result.ResultList).filter(i=>!i.SipAddress || i.SipAddress!=this.currentSip);        
          
          this.resultList.forEach(c=>{
            this.setContactPresence(c,'Offline');
            this.triggerAddToPersonCache(c,(person)=>{
              this.lyncApiPresence.bindPresenceListenerForPerson({id:person.id,displayName:person.displayName});
              this.lyncApiNote.bindNoteListenerForPerson({id:person.id,displayName:person.displayName});
            });
          });
          
          //this.bindPresenceListenersForContacts(this.resultList);
  
        }
        ,
        error:(err)=>{
          this.logger.log(err);
        }
  
      }
    };

    this.serviceCall.invokeService(args);
    
  }

  triggerAddToPersonCache(p:any,onAdded:(person:Person)=>void)
  {      
      this.logger.log(`contact-search.get-person:${p.DisplayName}`);

      this.lyncApiContacts.getPerson(p.SipAddress).then(p1=>{
          this.logger.log(`contact-search.get-person: ${p.DisplayName} ${p1.id}`);
          onAdded(p1);
      });
  }

  get currentSip()
  {
    return this.lyncApiGlobals.personSignedIn ? this.lyncApiGlobals.personSignedIn.id : '';
  }

  /* private bindPresenceListenersForContacts(contacts:any[]){

    this.resultList.forEach(r=>{

      this.lyncApiPresence.bindPresenceListenerForPerson({id:r.SipAddress,displayName:r.DisplayName});

    });

  } */

  private unBindPresenceListenersForContacts(contacts:any[]){

    contacts.forEach(r=>{

      this.lyncApiPresence.unbindPresenceListenerForPerson({id:r.SipAddress,displayName:r.DisplayName});

    });
    
  }

  presenceListenerSubscription:Subscription;
  noteListenerSubscription:Subscription;

  private bindPresenceChange(){


    this.logger.log('contact search component:bindPresenceChange');

    this.presenceListenerSubscription = this.lyncApiPresence.presenceChange.subscribe(change=>{

       
       this.logger.log(`contact search component:presence will change for ${change.personId} to ${change.presenceState}`);

       let contactIndex = this.resultList.findIndex(c=>c.SipAddress==change.personId);

       if(contactIndex>-1)
       {
          let contact = this.resultList[contactIndex];

          this.setContactPresence(contact,change.presenceState);          
          
          this.logger.log(`contact search component:presence changed for ${change.personId} to ${change.presenceState}`);
       }

    });    

  }  
  private bindNoteChange(){


    this.logger.log('contact search component:bindNoteChange');

    this.noteListenerSubscription = this.lyncApiNote.noteChange.subscribe(change=>{

       
       this.logger.log(`contact search component:note will change for ${change.personId} to ${change.note}`);

       let contactIndex = this.resultList.findIndex(c=>c.SipAddress==change.personId);

       if(contactIndex>-1)
       {
          let contact = this.resultList[contactIndex];

          this.setContactNote(contact,change.note);          
          
          this.logger.log(`contact search component:note changed for ${change.personId} to ${change.note}`);
       }

    });    

  }  

  private setContactPresence(contact:any,presence:any){

    let presenceItem = this.globals.findPresenceItem(presence);

    if (presenceItem) {
      contact.lastPresence = presenceItem.text;
      contact.lastPresenceItemPath = presenceItem.imagePath;
    }

  }  

  private setContactNote(contact:any,note:string){
      contact.lastNote = note;
  }

  shouldShowWarmTransfer(contact:any):boolean{
    return (this.hasTransferableCall || this.hasTransferableOutBoundCall) && 
              contact.lastPresence != 'DND' && contact.lastPresence != 'Offline';
  }

  shouldShowColdTransfer(contact:any):boolean{
    return (this.hasTransferableCall && this.isOperatorCallActive && contact.lastPresence == 'Online') ||
           (this.hasTransferableOutBoundCall && this.isOperator && contact.lastPresence == 'Online');
  }
  shouldShowPersonalPark(contact:any):boolean{
    return this.hasTransferableCall && this.isOperatorCallActive && contact.lastPresence != 'Online' && contact.lastPresence != 'Offline';
  }

  hasIncomingCall:boolean;
  hasTransferableCall:boolean;
  hasTransferableOutBoundCall:boolean;
  hasOutBoundCall:boolean;

  private bindCallViewStateChanged(){

    this.callViewStateMachine.stateChanged.subscribe(args=>{           

      this.hasTransferableCall = 
      args.currentState.toString() == StateName[StateName.FirstNormalAgentConnected] || 
      args.currentState.toString() == StateName[StateName.FirstOperatorAgentConnected];

      this.hasIncomingCall = args.currentState.toString() != StateName[StateName.OffHook];

    });

  }

  private bindOutBoundCallStateChanged(){
    this.outboundCallStateMachine.stateChanged.subscribe(args=>{

      this.hasTransferableOutBoundCall = args.currentState.toString() == OutBoundCallStateName[OutBoundCallStateName.Accepted];
      this.hasOutBoundCall = args.currentState.toString() != OutBoundCallStateName[OutBoundCallStateName.OffHook];

    });
  }
  
  isOperatorCallActive:boolean;
  private bindCallSessionStateChanged(){

    this.callSessionStateChangeListener.stateChanged.subscribe((mediaModel)=>{

      this.isOperatorCallActive = mediaModel.IsOperatorCall;    

    });
  }

  private bindOutBoundCallMessagesListener(){

    this.outboundCallMessagesListener.received.subscribe(model=>{
      //this.isOperatorCallActive = model.InitiatedFromOperatorQueue;

    });
  }

  get isOperator()
  {
    return this.roles.isInRole(UserRole.Operator);
  }  

  onStartWarmTransfer(targetUri:string)
  {
    if(this.hasIncomingCall)
    {
      this.callSessionRequests.warmTransferStart(targetUri);
    }
    else if(this.hasOutBoundCall)
    {
      this.callSessionRequests.outBoundWarmTransfer(targetUri);
    }
  }

  onColdTransfer(targetUri:string)
  {    
    if(this.hasIncomingCall)
    {
      this.callSessionRequests.coldTransfer(targetUri).then(success=>{
        this.lyncApiAudioService.hangUp();
    });

    }
    else if(this.hasOutBoundCall)
    {
      this.callSessionRequests.outBoundColdTransfer(targetUri);
    }

  }

}
