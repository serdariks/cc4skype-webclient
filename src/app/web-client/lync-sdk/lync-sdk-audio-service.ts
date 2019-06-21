import { LyncApiAudioService } from "../lync-api/lync-api-audio-service";
import { Subject } from "rxjs";
import { Person } from "../lync-api/lync-api-person";
import { Injectable } from "@angular/core";
import { IncomingRequests } from "../messaging/incoming-requests";
import { InvokeServiceArgs } from "../messaging/dto/invoke-service-args";
import { LoggingService } from "../../logging-service";
import { ServiceCall } from "../messaging/service-call";
import { LyncApiGlobals } from "../lync-api/lync-api-globals";
import { WebClientHostAddress } from "../services/web-client-host-address";

@Injectable()
export class LyncSDKAudioService implements LyncApiAudioService{

    constructor(private incomingRequests:IncomingRequests,
        private logger:LoggingService,private serviceCall:ServiceCall,private lyncApiGlobals:LyncApiGlobals,
        private webClientHostAddress:WebClientHostAddress)
    {
        this.bindCallStateChanged();
    }

    private lastState:any;

    hasActiveCall():boolean
    {
        return this.lastState == 'Connected' || this.lastState == 'Notified' || this.lastState == 'Connecting';
    }

    private bindCallStateChanged(){

        this.incomingRequests.received.subscribe((obj:any)=>{
              
            if(obj.Operation == 'CallStateChanged'){
                
                this.logger.log('CallStateChanged:' +  JSON.stringify(obj));

                let s = obj.RequestData;               

                this.lastState = s.State;

                let person1:Person = null;
                let person2:Person = null;
                
                let persons:Person[] = s.Participants.map(p=>{return {id:p.SipAddress,displayName:p.DisplayName};});

                persons = persons.filter(p=>p.id!=this.lyncApiGlobals.personSignedIn.id);

                if(persons.length > 0){
                    person1 = persons[0];
                }

                if(persons.length > 1){
                    person2 = persons[1];
                }

                this.callStateChanged.next({state:s.State,person1:person1,person2:person2});
            }
            
          });
    }

    callStateChanged:Subject<{state:any,person1:Person,person2:Person}> = new Subject<{state:any,person1:Person,person2:Person}>();
    
    call(targetUri: string):Promise<string> 
    {
      return new Promise<string>((resolve,reject)=>{

        let requestData =  {TargetUri:targetUri};
              
        let args:InvokeServiceArgs={
          
          targetRooms: [this.webClientHostAddress.Value],
          operation : "Call",      
          requestData : requestData,
    
          responseHandler : {
      
            success:(result)=>{          
               resolve(result);              
            }
            ,
            error:(err)=>{
              reject(err);
            }
      
          }
        };              

        this.serviceCall.invokeService(args);

      });

        
    }
    registerIncomingAudio() {
        //throw new Error("Method not implemented.");
    }
    acceptCall(): Promise<any> {
        
        return new Promise<any>((resolve,reject)=>{

            let requestData = null;
              
            let args:InvokeServiceArgs={
              
              targetRooms: [this.webClientHostAddress.Value],
              operation : "AcceptCall",      
              requestData : requestData,
        
              responseHandler : {
          
                success:(result)=>{          
                                 
                    resolve();
                }
                ,
                error:(err)=>{
                  this.logger.log(err);
                }
          
              }
            };
          
            this.serviceCall.invokeService(args);

        });

    }
    rejectCall(): Promise<any> {
        return new Promise<any>((resolve,reject)=>{

            let requestData = null;
              
            let args:InvokeServiceArgs={
              
              targetRooms: [this.webClientHostAddress.Value],
              operation : "RejectCall",      
              requestData : requestData,
        
              responseHandler : {
          
                success:(result)=>{          
                                 
                    resolve();
                }
                ,
                error:(err)=>{
                  this.logger.log(err);
                }
          
              }
            };
          
            this.serviceCall.invokeService(args);


        });
    }
    hangUp(): Promise<any> {
        return new Promise<any>((resolve,reject)=>{

            if(!this.hasActiveCall()){
                reject('lync-sdk-audio-service:no active conversation to hangup.');
                return;
            }

            let requestData = null;
              
            let args:InvokeServiceArgs={
              
              targetRooms: [this.webClientHostAddress.Value],
              operation : "HangupCall",      
              requestData : requestData,
        
              responseHandler : {
          
                success:(result)=>{          
                                 
                    resolve();
                }
                ,
                error:(err)=>{
                  this.logger.log(err);
                }
          
              }
            };
          
            this.serviceCall.invokeService(args);

        });
    }
    joinMeeting(meetingUrl: string) {
        throw new Error("Method not implemented.");
    }
    sendDTMF(tone: string) {

        let requestData =  {DTMFTone:tone};
              
        let args:InvokeServiceArgs={
          
          targetRooms: [this.webClientHostAddress.Value],
          operation : "SendDTMF",      
          requestData : requestData,
    
          responseHandler : {
      
            success:(result)=>{          
                             
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