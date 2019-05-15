import { WebSDKGlobals } from "./web-sdk-globals";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { LyncApiGlobals } from "../lync-api/lync-api-globals";
import { LyncApiSignIn } from "../lync-api/lync-api-signin";
import { WebSDKCache } from "./web-sdk-cache";
import { Person } from "../lync-api/lync-api-person";
import { ConfigService } from "../services/config-service";
import { Configuration } from "../services/configuration";

@Injectable()
export class WebSDKSignIn implements LyncApiSignIn{      

    private config:Configuration;
    
    constructor(private configService:ConfigService,private globals:WebSDKGlobals,private lyncApiGlobals:LyncApiGlobals,private cache:WebSDKCache){

        this.config = this.configService.Config;
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

            this.globals.client.signInManager.signIn({
                //version: version,
                username: username,
                password: password,
                origins: [
                    autoDiscoverRootUrl,
                    autoDiscoverRootUrl
                  ]
            }).then((response)=> {
        
                console.log('Signed in successfully.');                 
                
                   
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

}