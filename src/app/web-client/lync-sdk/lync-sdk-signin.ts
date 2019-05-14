import { LyncApiSignIn } from "../lync-api/lync-api-signin";
import { Person } from "../lync-api/lync-api-person";
import { Subject } from "rxjs";
import { Injectable } from "@angular/core";
import { IncomingRequests } from "../messaging/incoming-requests";
import { LyncApiGlobals } from "../lync-api/lync-api-globals";
import { InvokeServiceArgs } from "../messaging/dto/invoke-service-args";
import { LoggingService } from "../../logging-service";
import { ServiceCall } from "../messaging/service-call";
import { WebClientHostAddress } from "../services/web-client-host-address";

@Injectable()
export class LyncSDKSignIn implements LyncApiSignIn{
    
    userSignedIn:Subject<string>;
    userSignedOut:Subject<string>;

    constructor(private incomingRequests:IncomingRequests,private lyncApiGlobals:LyncApiGlobals,
        private logger:LoggingService,private serviceCall:ServiceCall,
        private webClientHostAddress:WebClientHostAddress){
        this.userSignedIn= new Subject<string>();
        this.userSignedOut = new Subject<string>();
        this.bindSignInEvents();
    }

    bindSignInEvents(){

        this.incomingRequests.received.subscribe((obj:any)=>{
              
            if(obj.Operation == 'SignedIn'){
                
               let d = obj.RequestData;

               let person:Person = {id:d.SipAddress,displayName:d.DisplayName};

               this.lyncApiGlobals.personSignedIn = person;
               this.lyncApiGlobals.clientSip = person.id;

               this.userSignedIn.next(d.SipAddress);


            }
            else if(obj.Operation == 'SignedOut'){
                this.userSignedOut.next('');
            }
            //this.logger.log(`Received incoming request from subscription:${JSON.stringify(obj)}`);
          });
    }

    signIn(username,password):Promise<Person>
    {
        return new Promise((resolve,reject)=>{

            let requestData =  {Uri:username,Password:password};
              
            let args:InvokeServiceArgs={
              
              targetRooms: [this.webClientHostAddress.Value],
              operation : "SignIn",      
              requestData : requestData,
        
              responseHandler : {
          
                success:(result)=>{          
                    resolve(new Person());         
                }
                ,
                error:(err)=>{
                  this.logger.log(err);
                  reject(err);
                }
          
              }
            };
          
            this.serviceCall.invokeService(args); 

        });

       
    }
    signOut():Promise<any>{
        return new Promise((resolve,reject)=>{

            //let requestData;
              
            let args:InvokeServiceArgs={              
              
              targetRooms: [this.webClientHostAddress.Value],
              operation : "SignOut",      
              requestData : null,
        
              responseHandler : {
          
                success:(result)=>{          
                    resolve(new Person());         
                }
                ,
                error:(err)=>{
                  this.logger.log(err);
                  reject(err);
                }
          
              }
            };
          
            this.serviceCall.invokeService(args); 

        });
    }

    


}