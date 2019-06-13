import { InitializeData } from "./initialize-data";
import { LyncApiGlobals } from "../lync-api/lync-api-globals";
import { LoggingService } from "../../logging-service";
import { LyncApiContainer } from "../lync-api/lync-api-container";
import { LyncApiAudioService } from "../lync-api/lync-api-audio-service";
import { InvokeServiceArgs } from "../messaging/dto/invoke-service-args";
import { ServiceCall } from "../messaging/service-call";
import { Injectable } from "@angular/core";

@Injectable()
export class OutboundCall{

    private lyncApiAudioService:LyncApiAudioService;

    constructor(private initializeData:InitializeData,private lyncApiGlobals:LyncApiGlobals,
        private logger:LoggingService,private apiContainer:LyncApiContainer,private serviceCall:ServiceCall)
    {
        this.lyncApiAudioService = apiContainer.currentApi.audioService;

    }
    start(number:string):Promise<any>{

        return new Promise<any>((resolve,reject)=>{
    
          let callerSip:string = this.lyncApiGlobals.personSignedIn.id;
    
          if(this.initializeData.endpoints.length == 0) 
          {
            reject(`outbound-call: no endpoint exists for calling`);
            return;
          }
    
          let endpoint = this.initializeData.endpoints[0];//TODO!!for now the first endpoint, later we will choose the endpoint from a dropdown above dialpad!
          
    
          this.startContactCenterCall(endpoint,nextInstance=>{
            
            this.addOutBoundCallRequest(callerSip,number,(result:boolean)=>{
    
              this.logger.log(`outbound-call: request registered:${nextInstance}`);
    
              if(result == true)
              {
                this.logger.log(`outbound-call: will start call:${nextInstance}`);
    
                this.lyncApiAudioService.call(nextInstance);  
                resolve();
    
              } 
              else
              {
                
                let errorStr = `outbound-call: call won't be executed. Request registration returned false.`;
                this.logger.log(errorStr);
                reject(errorStr)
    
              }         
              
    
            });
          
          });
    
        });    
    
      }
    
      /** Web clients will use this to register a call request and also to receive the endpoint uri of 
       the actual contact center instance according to load balance rule.
       We are registering a record on Redis showing that we will call from this caller sip right now and it's a web client call
      */
      private startContactCenterCall(originalEndpoint:any, onSuccess:(nextInstance:string)=>void){
        
        let caller = this.lyncApiGlobals.personSignedIn;         
        
        let requestData =  {
          OriginalEndpointCalledSip:originalEndpoint.EndpointSipUri,
          OriginalEndpointCalledLineUri:originalEndpoint.EndpointLineUri,
          CallerUri:caller.id,
          CallerDisplayName:caller.displayName}; 
      
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
    
      /**
       * 
       * @param callerSip Who's the call originator
       * @param number Number to be called
       * @param onSuccess a handler which takes the result of the registration operation,
       *  true means we can go ahead and call, if false we shouldn't
       * 
       * This will register this caller on redis server that next call from him will be an outbound call
       */
      private addOutBoundCallRequest(callerSip:string,number:string,onSuccess:(result:boolean)=>void){
        
        let caller = this.lyncApiGlobals.personSignedIn;    
    
        let requestData =  {CallerSip:callerSip,Number:number}; 
      
        let args:InvokeServiceArgs={
          
          targetService : "CC4Skype.CallCenterService",
          operation : "AddOutBoundCallRequest",      
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