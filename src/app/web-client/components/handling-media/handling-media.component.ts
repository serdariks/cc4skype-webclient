import { Component, OnInit } from '@angular/core';
import { LoggingService } from '../../../logging-service';
import { Listeners } from '../../services/listeners';
import { Listener } from '../../services/listener';
import { LyncApiGlobals } from '../../lync-api/lync-api-globals';
import { CallSessionRequests, MonitoringType} from '../../services/call-session-requests';
import { LyncApiAudioService } from '../../lync-api/lync-api-audio-service';
import { LyncApiContainer } from '../../lync-api/lync-api-container';

@Component({
  selector: 'app-handling-media',
  templateUrl: './handling-media.component.html',
  styleUrls: ['./handling-media.component.css']
})
export class HandlingMediaComponent implements OnInit {

  monitorIconPath:string = 'assets/img/cc4s/Monitor.png';
  whisperIconPath:string = 'assets/img/cc4s/Whisper.png';
  bargeInIconPath:string = 'assets/img/cc4s/BargeIn.png';

  list:any[] = [];

  private handlingMediaChangedListener:Listener<any>;
  private lyncApiAudioService:LyncApiAudioService;
  private lyncApiGlobals:LyncApiGlobals;

  constructor(listeners:Listeners,private logger:LoggingService,
    private callSessionRequests:CallSessionRequests,apiContainer:LyncApiContainer) 
  { 
    this.handlingMediaChangedListener = listeners.createListener<any>('HandlingMediaChanged');
    this.lyncApiAudioService = apiContainer.currentApi.audioService;
    this.lyncApiGlobals = apiContainer.currentApi.globals;
  }

  ngOnInit() {

    this.bindHandlingMediaChange();

  }

  bindHandlingMediaChange(){

    this.handlingMediaChangedListener.received.subscribe(model=>{
      this.logger.log(`handling-media-component. model received:${JSON.stringify(model)}`);
      this.processHandlingMediaChange(model);
    });

  }

  processHandlingMediaChange(model:any){

     let existingMediaIndex = this.list.findIndex(i=>i.SessionId == model.SessionId);

     if(existingMediaIndex >=0)
     {

        if(this.validateMediaRemoveRule(model)) //remove
        {
          this.list.splice(existingMediaIndex,1);

          if(model.SessionId == this.lastSessionMonitored)
          {
            this.lastSessionMonitored = null;
          }
        }
        else //update
        {
          
          //let keepMonitoringState = this.isMonitoringEnded(model) ? 'None' : this.list[existingMediaIndex].currentMonitoringState;

          this.list.splice(existingMediaIndex,1,model);

          this.list[existingMediaIndex].currentMonitoringState = model.MonitorTypeAsString;

          this.logger.log(`handling-media-component.currentMonitoringState:${model.MonitorTypeAsString}`);

          if(model.MonitorTypeAsString == 'None' && model.SessionId == this.lastSessionMonitored)
          {            
              this.lastSessionMonitored = null;
          }

          //this.list[existingMediaIndex].currentMonitoringState = keepMonitoringState;

        }

     }
     else
     {

       if(this.validateAddRule(model))
       {
          this.list.push(model);
       }

     }

  }

  private get currentSip():string{

    return this.lyncApiGlobals.personSignedIn.id;
  }


  private validateMediaRemoveRule(model:any):boolean{
    
    //this remove rule below gathered from cc4skype windows client SupervisorTabControlCore.UpdateCall method
    return (model.StatusAsString == 'Terminated' || model.StatusAsString == 'UnAssigned' && this.checkNotNullOrEmpty(model.PrimaryAgentSIP) 
      && model.PrimaryAgentSIP == this.currentSip && model.ConferenceActionAsString != 'SimultaniousIgnored') 
      ||
      (model.ConferenceActionAsString == 'Terminated' || model.ConferenceActionAsString == 'OperatorPark');
    
  }

  private isMonitoringEnded(model:any):boolean
  {
    return model.ConferenceActionAsString == 'SupervisorClosed' || model.ConferenceActionAsString == 'MonitoringEnded';
  }

  private checkNotNullOrEmpty(value:any):boolean{

    return value!=undefined && value!=null && value != '';

  }

  private validateAddRule(model:any){

    //this add rule below gathered from cc4skype windows client SupervisorTabControlCore.UpdateCall method

    let result:boolean = this.checkNotNullOrEmpty(model.PrimaryAgentSIP) && model.PrimaryAgentSIP != this.currentSip 
      && !(model.StatusAsString == 'Terminated' || model.StatusAsString == 'UnAssigned' || model.StatusAsString == 'Ringing');

      if(result){

         let previousAction:string = this.getPreviousAction(model);

         if(previousAction == 'OperatorPark' || model.ConferenceActionAsString == 'OnHold'){
           result = false;
         }

      }

    return result;

  }

  private getPreviousAction(model: any): string {

    let actionList: string[] = model.ActionHistoryAsString;

    if (actionList.length == 0)
      return 'Ringing';

    if (actionList.length <= 1)
      return actionList[0];

    let actionListReversed = actionList.reverse();
    return actionListReversed[1];

  }
  

  monitoringStateClass(model:any,monitorButtonName:string):string
  {
      return model.currentMonitoringState == monitorButtonName ? 'active' : '';
  }

  lastSessionMonitored:string;

  onToggleMonitoringState(model:any,nextMonitorAction:string){

    if(this.lastSessionMonitored && this.lastSessionMonitored!=model.SessionId){ //then there's another active call being monitored!

      this.logger.log(`handling-media.onToggleMonitoringState. there is already a monitoring presence for another call, 
      first going to terminate it.  lastSessionMonitored:${this.lastSessionMonitored} new session:${model.SessionId}`);

      //wait until that monitoring terminates and then monitor the other call
      this.lyncApiAudioService.hangUp().then(()=>{

        this.lastSessionMonitored = null;

        this.logger.log('handling-media.onToggleMonitoringState. previous monitoring session terminated, now will start monitoring for the new session');

        this.toggleMonitoringStateCore(model,nextMonitorAction);

      });
    }
    else
    {
      this.logger.log('handling-media.onToggleMonitoringState. No previous session, will start monitoring for the new session.');
      //there is currently no call being monitored, or this is another type of monitoring request issued to a call currently monitored(including 'None' type)
      this.toggleMonitoringStateCore(model,nextMonitorAction);

    }       

  } 

  toggleMonitoringStateCore(model:any,nextMonitorAction:string){

    this.callSessionRequests.toggleMonitoringState(
      { 
        currentMonitoringState:model.currentMonitoringState,
        ConversationKey: model.ConversationKey,
        SessionId:model.SessionId
      },
        nextMonitorAction).then((resultMonitoringType:MonitoringType)=>{
          
          if(resultMonitoringType ==  MonitoringType.None)
          {
            this.lastSessionMonitored = null;
          }
          else
          {
            this.lastSessionMonitored = model.SessionId;
          }

        });

  }




}
