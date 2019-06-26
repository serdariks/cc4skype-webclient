import { WebSDKGlobals } from "./web-sdk-globals";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { LyncApiGlobals } from "../lync-api/lync-api-globals";
import { LyncApiSignIn } from "../lync-api/lync-api-signin";
import { WebSDKCache } from "./web-sdk-cache";
import { Person } from "../lync-api/lync-api-person";
import { ConfigService } from "../services/config-service";
import { Configuration } from "../services/configuration";
import { InvokeServiceArgs } from '../messaging/dto/invoke-service-args';
import { SocketManager } from '../messaging/socket-manager';
import { Listeners } from '../services/listeners';
import { Listener } from '../services/listener';
import { ServiceCall } from '../messaging/service-call';


@Injectable()
export class WebSDKSignIn implements LyncApiSignIn{      

    private config:Configuration;
    private signOutOtherLoginsListener:Listener<any>;
    constructor(private configService:ConfigService,private globals:WebSDKGlobals,private lyncApiGlobals:LyncApiGlobals,private cache:WebSDKCache,private socketManager:SocketManager,private listeners:Listeners,private serviceCall:ServiceCall){

        this.config = this.configService.Config;
        this.signOutOtherLoginsListener = this.listeners.createListener<any>("signOutOtherLogins");
        this.bindSignOutOtherLoginsListener();
    }
    
    private bindSignOutOtherLoginsListener(){
        this.signOutOtherLoginsListener.received.subscribe((data)=>{
             console.log(`WebSDKSignIn.bindSignOutOtherLoginsListener.received: ${JSON.stringify(data)}`);
             
        });
    }

    userSignedIn= new Subject<string>();
    userSignedOut = new Subject<string>();

    signIn(username,password):Promise<Person>{

        return new Promise<Person>((resolve,reject)=>{     
            
           /*  let token:string = "Bearer cwt=AAEBHAEFAAAAAAAFFQAAAOkAbmtgTEHiLr1MIRdQGAAPIWh0dHA6Ly9zZXJkYXIuY2M0c2t5cGUubG9jYWw6NDIwMBIAgRDUuSJqt7TGU67folrAzxrQggKphYMgAcw2BD-JU-V66gST8KW-XDu4JA-4STs2Thx0hqz1q9-GCFqUfBDdH9YIDRDUuSJqt7TGU67folrAzxrQ";

            let aaa = this.globals.client.signInManager;

            this.signInWithToken(token).then(()=>{
                console.log('sign in with token success');
                let webSDKPersonSignedIn = this.globals.client.personsAndGroupsManager.mePerson;

                let bbb = aaa;
                let client = this.globals.client;

                resolve(webSDKPersonSignedIn);
            }).catch(error=>{
                console.log('sign in with token failed' + error);
                reject(error);
            });            

            return; */

            let autoDiscoverRootUrl:string = `${this.config.lyncServerFQDN}/autodiscover/autodiscoverservice.svc/root`;

           // let xframeUrl:string = `${this.config.lyncServerFQDN}/xframe`;

/*             this.globals.client.signInManager.signIn({
                   
                domain: "cc4skype.com",
                auth: function (req, get) {
                    var src = this.src(); // e.g. https://pool-a.contoso.com/xframe
                
                    return get(req).then(function (rsp) {
                        if (rsp.status != 401)
                            return rsp;
                            
                        // note, that req.url may contain ony path, e.g. /ucwa/v1/oauth/applications/1132
                        // and the getAccessTokenFor function needs to use the src value to get the token audience
                        let token = this.getAccessTokenFor(req, rsp, src);
                        req.headers["Authorization"] = "Bearer " + token;
                        return get(req);

                       //  return this.getAccessTokenFor(req, rsp, src).then(function (token) {
                         //   req.headers["Authorization"] = "Bearer " + token;
                           // return get(req);
                        //}); 
                    });
                }
            }) */

            this.globals.client.signInManager.signIn({
                //version: version,
                username: username,
                password: password,
                //root: { user: `${this.config.lyncServerFQDN}/autodiscover/autodiscoverservice.svc/user` },
                
                origins: [
                    autoDiscoverRootUrl,
                    autoDiscoverRootUrl
                ]
                  
            })
            .then((response)=> {
        
                console.log('Signed in successfully.');                 
                
                this.signOutOtherLogins().then(()=>{
                    
                });
                   
                //this.lyncApiGlobals.clientSip = username;
        
                let webSDKPersonSignedIn = this.globals.client.personsAndGroupsManager.mePerson;                

                this.cache.persons.addOrUpdate(webSDKPersonSignedIn);

                let person:Person = this.cache.persons.convertToPerson(webSDKPersonSignedIn);
                   
                this.lyncApiGlobals.personSignedIn = person; 

                this.lyncApiGlobals.clientSip = person.id;
        
                var presenceState = webSDKPersonSignedIn.status;                
    
                console.log('presence=' + presenceState);
                console.log('display name:' + webSDKPersonSignedIn.displayName());                 

                resolve(person);

                this.userSignedIn.next(username);                                      
        
            })            
            .catch((error)=> {
                
                reject(error);

                console.log('Failed to sign in.');
            });

        });       
    
    }

    getAccessTokenFor(req, rsp, src){

       return "";

    }

    private signInWithToken(access_token:string):Promise<any>{

        return new Promise((resolve,reject)=>{


            let domain = 'cc4skype.local';
        
            var options = {
                auth: function (req, send) {
                    req.headers['Authorization'] = access_token.trim();
                    return send(req);
                },
                domain: domain
            };

            this.globals.client.signInManager.signIn(options).then((response1) => {              
                    resolve('success');
                }, 
                error=> {                
                    reject(error);
            });

        });        
    }

    signOut():Promise<any>{
        return new Promise((resolve,reject)=>{            

            this.globals.client.signInManager.signOut().then(()=>{
                this.createNewClient();                
                this.lyncApiGlobals.personSignedIn = null;
                resolve('logged out');
                this.userSignedOut.next('');
            }).catch(error=>{
                reject(error);
            });

        });

        
    }

    private createNewClient(){

        var Application = this.globals.api.application;
    
        this.globals.client = new Application();
    
    }

    private signOutOtherLogins(): Promise<any[]> {


        return new Promise<Array<any>>((resolve, reject) => {
    
          let currentUri:string =  this.lyncApiGlobals.personSignedIn.id;
          let socketId:string = this.socketManager.socketId;
    
          let requestData = {socketId:socketId,currentUri:currentUri};
    
          let args: InvokeServiceArgs = {
    
            targetService: currentUri
            ,
            operation: "signOutOtherLogins",
    
            requestData: requestData,
    
            responseHandler: {
    
              success: (result) => {
    
                //this.logger.log('GetEndpointList response received: ' + JSON.stringify(result));
    
                  resolve(result);                
    
              }
              ,
              error: (err) => {
                //this.logger.log(err);
                reject(err);
              }
    
            }
          };
    
          this.serviceCall.invokeService(args);
    
    
        });
    
    
    
      }

}