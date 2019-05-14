import { InvokeServiceArgs } from "../messaging/dto/invoke-service-args";
import { Injectable } from "@angular/core";
import { LoggingService } from "../../logging-service";
import { ServiceCall } from "../messaging/service-call";
import { LyncApiGlobals } from "../lync-api/lync-api-globals";
import { ActiveCallSession } from "./active-call-session";
import { LyncApiContainer } from "../lync-api/lync-api-container";
import { LyncApiAudioService } from "../lync-api/lync-api-audio-service";
import { InitializeData } from "./initialize-data";

@Injectable()
export class CallSessionRequests {

  private lyncApiAudioService:LyncApiAudioService;

  constructor(private logger: LoggingService, private serviceCall: ServiceCall,
    private lyncApiGlobals: LyncApiGlobals, private activeCallSession: ActiveCallSession,private apiContainer:LyncApiContainer,private initializeData:InitializeData) {

      this.lyncApiAudioService = apiContainer.currentApi.audioService;

  }

  private getCallSessionRequest(): CallSessionRequestDTO {

    let requestData: CallSessionRequestDTO = {
      InstanceKey: this.activeCallSession.instanceKey,
      ConversationKey: this.activeCallSession.conversationKey,
      SessionId: this.activeCallSession.sessionId,
      SourceUri: this.lyncApiGlobals.personSignedIn.id
    };

    return requestData;
  }
  agentPutOnHold() {


    let requestData = this.getCallSessionRequest();

    let args: InvokeServiceArgs = {

      targetRooms: [requestData.InstanceKey]
      ,
      operation: "AgentPutOnHold",

      requestData: requestData,

      responseHandler: {

        success: (result) => {

          this.logger.log('AgentPutOnHold response received: ' + JSON.stringify(result));

        }
        ,
        error: (err) => {
          this.logger.log(err);
        }

      }
    };

    this.serviceCall.invokeService(args);

  }

  agentResumed() {


    let requestData = this.getCallSessionRequest();

    let args: InvokeServiceArgs = {

      targetRooms: [requestData.InstanceKey]
      ,
      operation: "AgentResumed",

      requestData: requestData,

      responseHandler: {

        success: (result) => {

          this.logger.log('AgentResumed response received: ' + JSON.stringify(result));

        }
        ,
        error: (err) => {
          this.logger.log(err);
        }

      }
    };

    this.serviceCall.invokeService(args);

  }

  warmTransferStart(targetUri: string) {


    let callSessionRequest = this.getCallSessionRequest();

    let requestData = { CallSessionRequest: this.getCallSessionRequest(), TargetUri: targetUri };

    let args: InvokeServiceArgs = {

      targetRooms: [callSessionRequest.InstanceKey]
      ,
      operation: "WarmTransferStart",

      requestData: requestData,

      responseHandler: {

        success: (result) => {

          this.logger.log('WarmTransferStart response received: ' + JSON.stringify(result));

        }
        ,
        error: (err) => {
          this.logger.log(err);
        }

      }
    };

    this.serviceCall.invokeService(args);

  }

  warmTransferCancel(targetUri: string) {

    let callSessionRequest = this.getCallSessionRequest();

    let requestData = { CallSessionRequest: this.getCallSessionRequest(), TargetUri: targetUri };

    let args: InvokeServiceArgs = {

      targetRooms: [callSessionRequest.InstanceKey]
      ,
      operation: "WarmTransferCancel",

      requestData: requestData,

      responseHandler: {

        success: (result) => {

          this.logger.log('WarmTransferCancel response received: ' + JSON.stringify(result));

        }
        ,
        error: (err) => {
          this.logger.log(err);
        }

      }
    };

    this.serviceCall.invokeService(args);

  }

  switchToCallerDuringWarmTransfer() {

    let requestData = this.getCallSessionRequest();

    let args: InvokeServiceArgs = {

      targetRooms: [requestData.InstanceKey]
      ,
      operation: "SwitchToCallerDuringWarmTransfer",

      requestData: requestData,

      responseHandler: {

        success: (result) => {

          this.logger.log('SwitchToCallerDuringWarmTransfer response received: ' + JSON.stringify(result));

        }
        ,
        error: (err) => {
          this.logger.log(err);
        }

      }
    };

    this.serviceCall.invokeService(args);

  }
  switchToAgentDuringWarmTransfer() {

    let requestData = this.getCallSessionRequest();

    let args: InvokeServiceArgs = {

      targetRooms: [requestData.InstanceKey]
      ,
      operation: "SwitchToAgentDuringWarmTransfer",

      requestData: requestData,

      responseHandler: {

        success: (result) => {

          this.logger.log('SwitchToAgentDuringWarmTransfer response received: ' + JSON.stringify(result));

        }
        ,
        error: (err) => {
          this.logger.log(err);
        }

      }
    };

    this.serviceCall.invokeService(args);

  }

  toggleRecording() {

    let requestData = this.getCallSessionRequest();

    let args: InvokeServiceArgs = {

      targetRooms: [requestData.InstanceKey]
      ,
      operation: "ToggleRecording",

      requestData: requestData,

      responseHandler: {

        success: (result) => {

          this.logger.log('ToggleRecording response received: ' + JSON.stringify(result));

        }
        ,
        error: (err) => {
          this.logger.log(err);
        }

      }
    };

    this.serviceCall.invokeService(args);

  }

  parkCall() {

    let requestData = this.getCallSessionRequest();

    let args: InvokeServiceArgs = {

      targetRooms: [requestData.InstanceKey]
      ,
      operation: "ParkCall",

      requestData: requestData,

      responseHandler: {

        success: (result) => {

          this.logger.log('ParkCall response received: ' + JSON.stringify(result));

        }
        ,
        error: (err) => {
          this.logger.log(err);
        }

      }
    };

    this.serviceCall.invokeService(args);

  }

  startRejoinCall(conversationKey: string, sessionId: string): Promise<boolean> {

    return new Promise<boolean>((resolve, reject) => {

      this.getSessionInstanceKey(sessionId).then(instanceKey => {

        if (!instanceKey) {
          return;
        }

        let requestData = { ConversationKey: conversationKey, OperatorSip: this.lyncApiGlobals.personSignedIn.id };

        let args: InvokeServiceArgs = {

          targetRooms: [instanceKey]
          ,
          operation: "StartRejoinCall",

          requestData: requestData,

          responseHandler: {

            success: (result) => {

              this.logger.log('startRejoinCall response received: ' + JSON.stringify(result));

              resolve(result);

            }
            ,
            error: (err) => {
              reject(err);
              this.logger.log(err);
            }

          }
        };

        this.serviceCall.invokeService(args);

      });

    });

  }


  toggleMonitoringState(
    model: { currentMonitoringState: string, ConversationKey: string, SessionId: string },
    nextMonitorAction: string): Promise<MonitoringType> {

    return new Promise<MonitoringType>((resolve, reject) => {

      let monitorAction: string;

      if (!model.currentMonitoringState) 
      {

        //model.currentMonitoringState = monitorButtonName;
        monitorAction = nextMonitorAction;

      }
      else {
        
        if (model.currentMonitoringState == nextMonitorAction) 
        {
          //model.currentMonitoringState = 'None';      
          monitorAction = 'None';
        }
        else 
        {
          //model.currentMonitoringState = monitorButtonName;
          monitorAction = monitorAction;
        }

      }

      if (monitorAction == 'None') 
      {
        
        this.lyncApiAudioService.hangUp().then(()=>{
          resolve(MonitoringType.None);
        });

      }
      else 
      {
        
        let monitoringType = MonitoringType[nextMonitorAction];

        this.monitor(model, monitoringType);

        resolve(monitoringType);
        
      }

    });

  }   

  private monitor(model:{ConversationKey:string,SessionId:string},monitoringType:MonitoringType){    

    this.logger.log('handlin-media.startMonitoring enter');

    this.startMonitor(model.ConversationKey,model.SessionId,monitoringType).then(shouldStart=>{
      
      if(shouldStart){
       
        this.getDNISBySessionId(model.SessionId).then(dnis=>{

          this.lyncApiAudioService.call(dnis);
  
        });

      }      

    });

}

  private startMonitor(conversationKey: string, sessionId: string,monitoringType:MonitoringType): Promise<boolean> {

    return new Promise<boolean>((resolve, reject) => {

      this.getSessionInstanceKey(sessionId).then(instanceKey => {

        if (!instanceKey) {
          return;
        }

        let requestData = { ConversationKey: conversationKey, SourceUri: this.lyncApiGlobals.personSignedIn.id,MonitorType: monitoringType };

        let args: InvokeServiceArgs = {

          targetRooms: [instanceKey]
          ,
          operation: "StartMonitor",

          requestData: requestData,

          responseHandler: {

            success: (result) => {

              this.logger.log('StartMonitor response received: ' + JSON.stringify(result));

              resolve(result);

            }
            ,
            error: (err) => {
              reject(err);
              this.logger.log(err);
            }

          }
        };

        this.serviceCall.invokeService(args);

      });

    });

  }

  getSessionInstanceKey(sessionId: string): Promise<string> {


    return new Promise<string>((resolve, reject) => {


      let requestData = { SessionId: sessionId };

      let args: InvokeServiceArgs = {

        targetService: 'CC4Skype.CallCenterService'
        ,
        operation: "GetSessionInstanceKey",

        requestData: requestData,

        responseHandler: {

          success: (result) => {

            this.logger.log('getSessionInstanceKey response received: ' + JSON.stringify(result));

            if (!result || result == '') {
              reject(`instance key cannot be found for session id:${sessionId}`);
            }
            else {
              resolve(result);
            }

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

  getDNISBySessionId(sessionId: string): Promise<string> {


    return new Promise<string>((resolve, reject) => {


      let requestData = { SessionId: sessionId };

      let args: InvokeServiceArgs = {

        targetService: 'CC4Skype.CallCenterService'
        ,
        operation: "GetDNISBySessionId",

        requestData: requestData,

        responseHandler: {

          success: (result) => {

            this.logger.log('getSessionInstanceKey response received: ' + JSON.stringify(result));

            if (!result || result == '') {
              reject(`DNIS cannot be found for session id:${sessionId}`);
            }
            else {
              resolve(result);
            }

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

  coldTransfer(targetUri: string): Promise<boolean> {

    return new Promise<boolean>((resolve, reject) => {

      let callSessionRequest = this.getCallSessionRequest();

      let requestData = { CallSessionRequest: this.getCallSessionRequest(), TargetUri: targetUri };

      let args: InvokeServiceArgs = {

        targetRooms: [callSessionRequest.InstanceKey]
        ,
        operation: "ColdTransfer",

        requestData: requestData,

        responseHandler: {

          success: (result) => {

            this.logger.log('ColdTransfer response received: ' + JSON.stringify(result));

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

  outBoundPutOnHold() {


    let requestData = this.getCallSessionRequest();

    let args: InvokeServiceArgs = {

      targetRooms: [requestData.InstanceKey]
      ,
      operation: "OutBoundOnHold",

      requestData: requestData,

      responseHandler: {

        success: (result) => {

          this.logger.log('OutBoundOnHold response received: ' + JSON.stringify(result));

        }
        ,
        error: (err) => {
          this.logger.log(err);
        }

      }
    };

    this.serviceCall.invokeService(args);

  }

  outBoundResume() {


    let requestData = this.getCallSessionRequest();

    let args: InvokeServiceArgs = {

      targetRooms: [requestData.InstanceKey]
      ,
      operation: "OutBoundResumeCall",

      requestData: requestData,

      responseHandler: {

        success: (result) => {

          this.logger.log('OutBoundResumeCall response received: ' + JSON.stringify(result));

        }
        ,
        error: (err) => {
          this.logger.log(err);
        }

      }
    };

    this.serviceCall.invokeService(args);

  }

  outBoundManualRecordStart() {


    let requestData = this.getCallSessionRequest();

    let args: InvokeServiceArgs = {

      targetRooms: [requestData.InstanceKey]
      ,
      operation: "OutBoundManualRecordStart",

      requestData: requestData,

      responseHandler: {

        success: (result) => {

          this.logger.log('OutBoundManualRecordStart response received: ' + JSON.stringify(result));

        }
        ,
        error: (err) => {
          this.logger.log(err);
        }

      }
    };

    this.serviceCall.invokeService(args);

  }

  outBoundManualRecordStop() {


    let requestData = this.getCallSessionRequest();

    let args: InvokeServiceArgs = {

      targetRooms: [requestData.InstanceKey]
      ,
      operation: "OutBoundManualRecordStop",

      requestData: requestData,

      responseHandler: {

        success: (result) => {

          this.logger.log('outBoundManualRecordStop response received: ' + JSON.stringify(result));

        }
        ,
        error: (err) => {
          this.logger.log(err);
        }

      }
    };

    this.serviceCall.invokeService(args);

  }

  outBoundWarmTransfer(targetUri:string) {


    let callSessionRequest = this.getCallSessionRequest();

    let requestData = {CallSessionRequest :callSessionRequest ,TargetUri:targetUri};

    let args: InvokeServiceArgs = {

      targetRooms: [callSessionRequest.InstanceKey]
      ,
      operation: "OutBoundWarmTransfer",

      requestData: requestData,

      responseHandler: {

        success: (result) => {

          this.logger.log('OutBoundWarmTransfer response received: ' + JSON.stringify(result));

        }
        ,
        error: (err) => {
          this.logger.log(err);
        }

      }
    };

    this.serviceCall.invokeService(args);

  }

  outBoundWarmTransferCancel(targetUri:string) {


    let callSessionRequest = this.getCallSessionRequest();

    let requestData = {CallSessionRequest :callSessionRequest ,TargetUri:targetUri};

    let args: InvokeServiceArgs = {

      targetRooms: [callSessionRequest.InstanceKey]
      ,
      operation: "OutBoundWarmTransferCancel",

      requestData: requestData,

      responseHandler: {

        success: (result) => {

          this.logger.log('OutBoundWarmTransferCancel response received: ' + JSON.stringify(result));

        }
        ,
        error: (err) => {
          this.logger.log(err);
        }

      }
    };

    this.serviceCall.invokeService(args);

  }

  outBoundSwitchToCaller() {


    let requestData = this.getCallSessionRequest();

    let args: InvokeServiceArgs = {

      targetRooms: [requestData.InstanceKey]
      ,
      operation: "OutBoundSwitchToCaller",

      requestData: requestData,

      responseHandler: {

        success: (result) => {

          this.logger.log('OutBoundSwitchToCaller response received: ' + JSON.stringify(result));

        }
        ,
        error: (err) => {
          this.logger.log(err);
        }

      }
    };

    this.serviceCall.invokeService(args);

  }

  outBoundSwitchToAgent() {


    let requestData = this.getCallSessionRequest();

    let args: InvokeServiceArgs = {

      targetRooms: [requestData.InstanceKey]
      ,
      operation: "OutBoundSwitchToAgent",

      requestData: requestData,

      responseHandler: {

        success: (result) => {

          this.logger.log('OutBoundSwitchToAgent response received: ' + JSON.stringify(result));

        }
        ,
        error: (err) => {
          this.logger.log(err);
        }

      }
    };

    this.serviceCall.invokeService(args);

  }

  outBoundColdTransfer(targetUri:string) {


    let callSessionRequest = this.getCallSessionRequest();

    let requestData = {CallSessionRequest :callSessionRequest ,TargetUri:targetUri};

    let args: InvokeServiceArgs = {

      targetRooms: [callSessionRequest.InstanceKey]
      ,
      operation: "OutBoundColdTransfer",

      requestData: requestData,

      responseHandler: {

        success: (result) => {

          this.logger.log('OutBoundColdTransfer response received: ' + JSON.stringify(result));

        }
        ,
        error: (err) => {
          this.logger.log(err);
        }

      }
    };

    this.serviceCall.invokeService(args);

  }


}

export class CallSessionRequestDTO {
  InstanceKey: string;
  ConversationKey: string;
  SourceUri: string;
  SessionId: string;

}

export enum MonitoringType{
  None,
  Silent,
  Whisper,
  BargeIn
}