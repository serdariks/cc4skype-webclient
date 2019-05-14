import { LyncApiPresence } from "../lync-api/lync-api-presence";
import { Person } from "../lync-api/lync-api-person";
import { Subject } from "rxjs";
import { Injectable } from "@angular/core";
import { IncomingRequests } from "../messaging/incoming-requests";
import { LoggingService } from "../../logging-service";
import { InvokeServiceArgs } from "../messaging/dto/invoke-service-args";
import { ServiceCall } from "../messaging/service-call";
import { Globals } from "../services/globals";
import { LyncApiGlobals } from "../lync-api/lync-api-globals";
import { WebClientHostAddress } from "../services/web-client-host-address";

@Injectable()
export class LyncSDKPresence implements LyncApiPresence{
    presenceChange = new Subject<{personId:string,presenceState:any}>();

    constructor(private incomingRequests:IncomingRequests,private logger:LoggingService,
        private serviceCall:ServiceCall,private globals:Globals,private lyncApiGlobals:LyncApiGlobals,
        private webClientHostAddress:WebClientHostAddress){

        this.bindPresenceChanged();
    }

    private bindPresenceChanged(){

        this.incomingRequests.received.subscribe((obj:any)=>{
              
            if(obj.Operation == 'PresenceChanged'){
                this.logger.log(`LyncSDKPresence. bindIncomingRequests received:uri:${obj.RequestData.Uri}`);
                //this.logger.log(`LyncSDKPresence. bindIncomingRequests:${JSON.stringify(obj.RequestData)}`);
                let apiPresence = this.globals.getApiPresenceForLyncSDKPresence(obj.RequestData.Presence as string);
                this.presenceChange.next({personId:obj.RequestData.Uri,presenceState:apiPresence});
                this.logger.log(`LyncSDKPresence. bindIncomingRequests resolved:uri:${obj.RequestData.Uri}, ${apiPresence}`);
            }
            //this.logger.log(`Received incoming request from subscription:${JSON.stringify(obj)}`);
          });
    }

    bindPresenceListenerForPerson(person:Person){
        
        let requestData =  {PersonId:person.id};
              
        let args:InvokeServiceArgs={
          
          targetRooms: [this.webClientHostAddress.Value],
          operation : "AddContactSubscription",      
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
    unbindPresenceListenerForPerson(person:Person){
        let requestData =  {PersonId:person.id};
              
        let args:InvokeServiceArgs={
          
          targetRooms: [this.webClientHostAddress.Value],
          operation : "RemoveContactSubscription",      
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
    setPresence(person:Person,status:any){
        //SetPresenceOfSignedInContact

        if(person.id != this.lyncApiGlobals.personSignedIn.id){ 
            //In contrary to Web SDK, Lync SDK only allows setting presence of signed in contact!
            return;
        }

        let requestData =  {Presence:status};
              
        let args:InvokeServiceArgs={
          
          targetRooms: [this.webClientHostAddress.Value],
          operation : "SetPresenceOfSignedInContact",      
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