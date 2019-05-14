import { LyncApiInitializer } from "../lync-api/lync-api-initializer";
import { Subject } from "rxjs";
import { InvokeServiceArgs } from "../messaging/dto/invoke-service-args";
import { LoggingService } from "../../logging-service";
import { ServiceCall } from "../messaging/service-call";
import { Injectable } from "@angular/core";
import { Person } from "../lync-api/lync-api-person";
import { LyncApiGlobals } from "../lync-api/lync-api-globals";
import { LyncSDKSignIn } from "./lync-sdk-signin";
import { WebClientHostAddress } from "../services/web-client-host-address";

@Injectable()
export class LyncSDKInitializer implements LyncApiInitializer{
    
    initialized:Subject<any>;    
    
    constructor(private logger:LoggingService,private serviceCall:ServiceCall,
      private lyncApiGlobals:LyncApiGlobals,private lyncSDKSignIn:LyncSDKSignIn,private webClientHostAddress:WebClientHostAddress){

    }

    initialize(): Promise<any> {
        return new Promise((resolve,reject)=>{

            this.testClientHost();

            this.getSignedInContact().then(c=>{
                if(c)
                {
                    this.logger.log(`Signed in contact:${c.id},${c.displayName}`);
                    
                    this.lyncApiGlobals.personSignedIn = c;
                    this.lyncApiGlobals.clientSip = c.id;

                    this.lyncSDKSignIn.userSignedIn.next();
                    resolve();

                }else{
                    this.logger.log('Signed in contact is null');
                }
            });

            

        });
    }

    testClientHost(){
        
        let requestData =  {};     
        
      
        let args:InvokeServiceArgs={
          
          targetRooms: [this.webClientHostAddress.Value],
          operation : "Test",      
          requestData : null,
    
          responseHandler : {
      
            success:(result)=>{          
              
              this.logger.log(`Client host test result:${result}`);
            }
            ,
            error:(err)=>{
              this.logger.log(err);
            }
      
          }
        };
      
        this.serviceCall.invokeService(args);
      
      }

      getSignedInContact():Promise<Person>{
        
        return new Promise((resolve,reject)=>{

            let requestData =  {};     
        
      
        let args:InvokeServiceArgs={
          
          targetRooms: [this.webClientHostAddress.Value],
          operation : "GetSignedInContact",      
          requestData : null,
    
          responseHandler : {
      
            success:(result)=>{          
              
                if(result){
                    resolve({id:result.SipAddress,displayName:result.DisplayName});
                }else{
                    resolve(null);
                }
                
              this.logger.log(`GetSignedInContact result:${result}`);
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

}