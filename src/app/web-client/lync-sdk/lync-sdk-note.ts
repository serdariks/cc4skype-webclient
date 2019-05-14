import { LyncApiNote } from "../lync-api/lync-api-note";
import { Person } from "../lync-api/lync-api-person";
import { Subject } from "rxjs";
import { Injectable } from "@angular/core";
import { IncomingRequests } from "../messaging/incoming-requests";
import { LoggingService } from "../../logging-service";
import { ServiceCall } from "../messaging/service-call";
import { Globals } from "../services/globals";
import { LyncApiGlobals } from "../lync-api/lync-api-globals";
import { WebClientHostAddress } from "../services/web-client-host-address";
import { InvokeServiceArgs } from "../messaging/dto/invoke-service-args";

@Injectable()
export class LyncSDKNote implements LyncApiNote{
    constructor(private incomingRequests:IncomingRequests,private logger:LoggingService,
        private serviceCall:ServiceCall,private globals:Globals,private lyncApiGlobals:LyncApiGlobals,
        private webClientHostAddress:WebClientHostAddress){

            this.bindNoteChange();

    }
    noteChange:Subject<{personId:string,note:string}> = new Subject<{personId:string,note:string}>();

    bindNoteChange(){

        this.incomingRequests.received.subscribe((obj:any)=>{
              
            if(obj.Operation == 'PersonalNoteChanged'){
                let personalNote = obj.RequestData.PersonalNote;
                this.noteChange.next({personId:obj.RequestData.Uri,note:personalNote});
                this.logger.log(`LyncSDKNote. bindIncomingRequests:uri:${obj.RequestData.Uri}, ${personalNote}`);
            }
            
          });

    }

    bindNoteListenerForPerson(person:Person){        
        
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
    unBindNoteListenerForPerson(person:Person){

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
    setNote(person:Person,note:string){

        if(person.id != this.lyncApiGlobals.personSignedIn.id){ 
            //In contrary to Web SDK, Lync SDK only allows setting note of signed in contact!
            return;
        }

        let requestData =  {PersonalNote:note};
              
        let args:InvokeServiceArgs={
          
          targetRooms: [this.webClientHostAddress.Value],
          operation : "SetPersonalNoteOfSignedInContact",      
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