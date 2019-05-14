import { Injectable } from "@angular/core";
import { LyncApiGlobals } from "../lync-api/lync-api-globals";
import { InvokeServiceArgs } from "../messaging/dto/invoke-service-args";
import { LoggingService } from "../../logging-service";
import { ServiceCall } from "../messaging/service-call";
import { LyncApiContainer } from "../lync-api/lync-api-container";
import { LyncApiSignIn } from "../lync-api/lync-api-signin";

@Injectable()
export class UserInitializeData{

    private lyncApiSignIn:LyncApiSignIn;
    
    constructor(private lyncApiGlobals:LyncApiGlobals,private serviceCall:ServiceCall,lyncApiContainer:LyncApiContainer,private logger:LoggingService){
        
        this.lyncApiSignIn = lyncApiContainer.currentApi.signIn;

        this.initialize();

        this.bindSignInEvents();

    }

    private bindSignInEvents(){

        this.lyncApiSignIn.userSignedIn.subscribe(s=>{
            this.initialize();
        });
        this.lyncApiSignIn.userSignedOut.subscribe(s=>{
            this.initialize();
        });

    }

    
    clientSip:string;

    userData:UserData = new UserData();

    initialize(){

        if(!this.lyncApiGlobals.personSignedIn){

            //signed out, reset
            this.userData = new UserData();

            return;
        }

        this.clientSip = this.lyncApiGlobals.personSignedIn.id;

        this.getClientRoles().then(clientRoles=>{
            this.userData.roles.clientRoles = clientRoles;
        });        

    }

    private getClientRoles(): Promise<any[]> {

        return new Promise<Array<any>>((resolve, reject) => {    
    
          let requestData = {ClientSip:this.clientSip};
    
          let args: InvokeServiceArgs = {
    
            targetService: 'CC4Skype.CallCenterService'
            ,
            operation: "GetClientRoles",
    
            requestData: requestData,
    
            responseHandler: {
    
              success: (result) => {
    
                this.logger.log('GetClientRoles response received: ' + JSON.stringify(result));
    
                  resolve(result);                
    
              }
              ,
              error: (err) => {
                this.logger.log(err);
                reject(err);
              }
    
            }
          };
    
          this.serviceCall.invokeService(args);
    
    
        });
    
    
    
      }      

}

export class UserData{

    roles:Roles=new Roles();        

}

export class Roles
{
    clientRoles:string[] = [];
    isInRole(role:UserRole):boolean{

        let roleAsString:string = UserRole[role].toString();

        let r:boolean = this.clientRoles.findIndex(r=>r == roleAsString) >= 0;

        return r;
    }
}

export enum UserRole{
    Admin,
    Agent,
    Operator,
    Supervisor
}