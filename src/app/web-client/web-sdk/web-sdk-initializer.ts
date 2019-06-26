import { WebSDKGlobals } from "./web-sdk-globals";
import { Injectable } from "@angular/core";
import { WebSDKSignIn } from "./web-sdk-signin";
import { Subject } from "rxjs";
import { LyncApiInitializer } from "../lync-api/lync-api-initializer";

declare var Skype: any;

@Injectable()
export class WebSDKInitializer implements LyncApiInitializer{
   
    constructor(private globals:WebSDKGlobals,private lyncApiSignIn:WebSDKSignIn){

    }

    initialized= new Subject<any>();

    initialize():Promise<any>{

        return new Promise((resolve,reject)=>{

            this.addScriptReference().then(()=>{

                Skype.initialize({ apiKey: this.globals.config.apiKey }, (apiObj)=>{

                    this.globals.api = apiObj;
                    //Application = api.application; // this is the Application constructor
                
                    
                    //var Application = api.application;
                
                    //client = new Application();
                    
                    //client = apiObj.UIApplicationInstance;
                
                    //client = api.application;
                
                    //client = new Skype.Web.Model.Application;
                
                    this.createNewClient();
    
                    resolve(this.globals.client);
                    this.initialized.next();
                
                    /* this.lyncApiSignIn.signIn(this.globals.clientSip,'cc4l!1234'); */
                    
                
                }, function (err) {
                    reject(err);
                    console.log("cannot load the sdk package", err);
                });

            });



        });       

    }

    private addScriptReference():Promise<void>{

        return new Promise<void>((resolve,reject)=>{

            var script = document.createElement('script');
            
            script.onload = function () {
                resolve();
            };
        
            script.src = decodeURIComponent('https://swx.cdn.skype.com/shared/v/1.2.15/SkypeBootstrap.min.js');
        
            document.head.appendChild(script);

        });

         
    }

    private createNewClient(){

        var Application = this.globals.api.application;
    
        this.globals.client = new Application();
    
    }
    
    

    
}

