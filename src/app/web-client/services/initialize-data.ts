import { ServiceCall } from "../messaging/service-call";
import { InvokeServiceArgs } from "../messaging/dto/invoke-service-args";
import { LoggingService } from "../../logging-service";
import { Injectable } from "@angular/core";
import { LyncApiContainer } from "../lync-api/lync-api-container";
import { LyncApiSignIn } from "../lync-api/lync-api-signin";

@Injectable()
export class InitializeData{   
    

    endpoints:any[]=[];

    

    constructor(private serviceCall:ServiceCall,private logger:LoggingService){

       

    }
    initialize()
    {
        this.loadEndpoints().then(endpoints=>{
            this.logger.log(`loadEndpoints:${JSON.stringify(endpoints)}`);
            this.endpoints = endpoints;

        }).catch(error=>{
            this.logger.log(error);
        });
        
    }    

    private loadEndpoints(): Promise<any[]> {


        return new Promise<Array<any>>((resolve, reject) => {
    
    
          let requestData = null;
    
          let args: InvokeServiceArgs = {
    
            targetService: 'CC4Skype.CallCenterService'
            ,
            operation: "GetEndpointList",
    
            requestData: requestData,
    
            responseHandler: {
    
              success: (result) => {
    
                this.logger.log('GetEndpointList response received: ' + JSON.stringify(result));
    
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