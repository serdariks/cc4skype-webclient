import { Injectable } from "@angular/core";
import { WebSDKGlobals } from "./web-sdk-globals";
import { Subject } from "rxjs";
import { LoggingService } from "../../logging-service";
import { LyncApiAudioService } from "../lync-api/lync-api-audio-service";
import { Person } from "../lync-api/lync-api-person";
import { WebSDKCache } from "./web-sdk-cache";

@Injectable()
export class WebSDKAudioService implements LyncApiAudioService{

    constructor(private globals:WebSDKGlobals,private logger:LoggingService,private cache:WebSDKCache){

    }

    private activeConversation:any;
    private currentState:any;

    //outgoingCallStateChanged = new Subject<{state:any,person1:any,person2:any}>();
    //incomingCallStateChanged = new Subject<{state:any,person1:any,person2:any}>(); 
    callStateChanged = new Subject<{state:any,person1:Person,person2:Person}>();  

    hasActiveCall()
    {
        return this.activeConversation!=null && this.activeConversation!=undefined;
    }
    
    private bindAudioStateChange(){

        if(!this.activeConversation){
            this.logger.log('no active conversation found to bind audio state');
            return;
        }

        this.activeConversation.selfParticipant.audio.state.changed((newState)=>{
            
            this.logger.log('bindAudioStateChange: state is:' + newState);        
    
            this.currentState = newState;

            let participants = this.getParticipants();   
            
            let person1 = this.cache.persons.convertToPerson(participants.person1);
            let person2 = this.cache.persons.convertToPerson(participants.person2);
            

            this.callStateChanged.next({state:newState,person1:person1,person2:person2});           

           /*  if(this.currentState == 'Disconnected'){

                this.activeConversation = null;                                
            } */    
           
        }); 

        this.activeConversation.state.once('Disconnected', ()=> {                               
                
                this.logger.log('registerIncomingAudio. Conversation disconnected');

                let client = this.globals.client;
    
                client.conversationsManager.conversations.remove(this.activeConversation);

                this.activeConversation = null;

                this.callStateChanged.next({state:'ConversationDisconnected',person1:null,person2:null});
            }); 
    }

    call(targetUri:string) {

        //var conversation = client.conversationsManager.createConversation();
    
        //var conversationParticipant = conversation.createParticipant(person);
    
        //conversation.participants.add(conversationParticipant);
    
        //client.conversationsManager.conversations.add(conversation);
    
        let client = this.globals.client;
                
        this.activeConversation = client.conversationsManager.getConversation(targetUri);
    
        //this.bindAudioStateChange();        
    
        var audioModality = this.activeConversation.activeModalities.audio;
    
        //console.log('audioModality=' + audioModality());
    
        this.activeConversation.audioService.start();
    
            
    }

    private getParticipants():{person1:any,person2:any}{

        let resp:{person1:any,person2:any} = {person1:null,person2:null};

        if(!this.activeConversation){
            return resp;
        }

        resp.person1 = this.activeConversation.participants()[0].person;        

        if(this.activeConversation.participants.length>1){
            resp.person2 = this.activeConversation.participants()[1].person;
        }

        return resp;
        
    }

    registerIncomingAudio() {

        let client = this.globals.client;

        client.conversationsManager.conversations.added((newConversation)=>{
    
            this.activeConversation = newConversation;
    
            this.logger.log('registerIncomingAudio. Conversation added.');                           

            //this.raiseIncomingCallStateChanged('ConversationReceived');            
    
            /* newConversation.changed(function () {
                
                console.log('conversation changed!');    		
    
            }); */

            this.bindAudioStateChange();
            this.bindParticipantEvents();
    
           /*  if (newConversation.audioService.accept.enabled() && newConversation.audioService.state() == 'Notified') {
                console.log('registerIncomingAudio. Conversation audio is acceptable.');
    
                this.raiseIncomingCallStateChanged('AcceptEnabledAndNotified');

                 //wire up audio state events
                newConversation.selfParticipant.audio.state.changed((newState)=> {    
                    
                    this.raiseIncomingCallStateChanged(newState);

                    console.log('registerIncomingAudio. CALL STATE IS: ' + newState);
    
                    if(newState == 'Connected')
                    {
                        //console.log('audio accepted');
    
                        //showAnsweredCall(caller);
                    }
                    else if(newState == 'Disconnected')
                    {
                        //removeCallView();
                    }
    
                });
    
                //newConversation.audioService.accept();
    
                //console.log('audio accepted');
            } */
    
            /* newConversation.state.once('Disconnected', function() {    
                
                this.raiseIncomingCallStateChanged('ConversationDisconnected');

                console.log('registerIncomingAudio. Conversation disconnected');
    
                client.conversationsManager.conversations.remove(newConversation);
                this.activeConversation = null;
            }); */
    
        });
    
    }
   

    acceptCall():Promise<any> 
    {
        return new Promise((resolve,reject)=>{

            this.activeConversation.audioService.accept().then(()=>{
                this.log('accepted');
                resolve('accepted');
            },(err)=>{
                                
                this.log('accept failed',err);                

                reject(this.getLog('accept failed',err));
            });

        
        });

        
    }

    private log(message:string,error?:any)
    {
        this.logger.log(this.getLog(message,error));
    }

    private getLog(message:string,error:any):string{
        if(error)
        {
            return `web-sdk-audio. ${message}: ${JSON.stringify(error)}`;
        }else{
            return `web-sdk-audio. ${message}`;
        }
    }
    rejectCall(): Promise<any> {
        /* this.activeConversation.audioService.reject(); */

        return new Promise((resolve, reject) => {

            try {
                
                if(this.activeConversation.audioService.reject.enabled())
                {
                    this.log('reject enabled');

                    this.activeConversation.audioService.reject().then(
                        () => {
                            resolve('rejected');
                        }
                        , 
                        err => {
                            this.log('reject error.', err);
                            reject(this.getLog('reject error.', err));
                        }
                );
                }

            } catch (err1) {
                this.log('reject catch error.', err1);
                reject(this.getLog('reject catch error.', err1));
            }

        });
    }

    hangUp():Promise<any>{

        return new Promise((resolve,reject)=>{

            if(!this.activeConversation){
                reject('web-sdk-audio-service:no active conversation to hangup');
                return;
            }
            
            this.activeConversation.leave().then(()=>{

                resolve('hangup');
                //removeCallView();
                // successfully left the conversation
            }, (error)=> {
                // error
            });            

        });

        
    }

    joinMeeting(meetingUrl:string) {

        //should be in conference uri format like below:
        //sip:sahin@cc4skype.local;gruu;opaque=app:conf:focus:id:1CZKYZ4Q
        //sahin user created the meeting, and the meeting url has the part 1CZKYZ4Q

        let client = this.globals.client;
        
        this.activeConversation = client.conversationsManager.getConversationByUri(meetingUrl);    
        
        this.bindParticipantEvents();

        this.activeConversation.audioService.start();
    }

    private bindParticipantEvents(){

        this.activeConversation.participants.added((p)=> {
            
            this.logger.log('Meeting participant added:' + p.person.displayName());

        });

        this.activeConversation.participants.removed((p)=> {

            this.logger.log('Meeting participant removed:' + p.person.displayName());
        });

    }

    sendDTMF(tone:string){
        
        if(this.activeConversation)
        {
            this.logger.log('before send dtmf:' + tone);
            this.activeConversation.audioService.sendDtmf(tone);
            this.logger.log('after send dtmf:' + tone);        
        }
    }

}