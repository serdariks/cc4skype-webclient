import { LyncApiContacts } from "../lync-api/lync-api-contacts";
import { Person } from "../lync-api/lync-api-person";
import { InvokeServiceArgs } from "../messaging/dto/invoke-service-args";
import { LoggingService } from "../../logging-service";
import { ServiceCall } from "../messaging/service-call";
import { Injectable } from "@angular/core";
import { WebClientHostAddress } from "../services/web-client-host-address";

@Injectable()
export class LyncSDKContacts implements LyncApiContacts{
    getPerson(id: string): Promise<Person> {
        return new Promise<Person>((resolve,reject)=>{
            let p = new Person();
            p.id = id;
            resolve(p);
        });
        //throw new Error("Method not implemented.");
    }

    constructor(private logger:LoggingService,
        private serviceCall:ServiceCall,private webClientHostAddress:WebClientHostAddress){

    }

    getAll():Promise<Person[]>{

        return new Promise((resolve,reject)=>{

            this.GetContactsOfSignedInContact().then(contacts=>{
                resolve(contacts);
            });
        });
        
    }

    private getPersonFromContactModel(contactModel:any):Person{
        return {id:contactModel.SipAddress,displayName:contactModel.DisplayName};
    }

    private GetContactsOfSignedInContact():Promise<Person[]>{
        
        return new Promise((resolve,reject)=>{

            let requestData =  {};     
        
      
        let args:InvokeServiceArgs={
          
          targetRooms: [this.webClientHostAddress.Value],
          operation : "GetContactsOfSignedInContact",      
          requestData : null,
    
          responseHandler : {
      
            success:(result)=>{          
              
                if(result){
                    resolve(result.map(r=>this.getPersonFromContactModel(r)));
                }else{
                    resolve(null);
                }
                
              this.logger.log(`GetContactsOfSignedInContact:${result}`);
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