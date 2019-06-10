import { Component, ChangeDetectorRef } from '@angular/core';
import { CallSessionStateChangeListener } from '../../../services/call-session-state-change-listener';
import { LoggingService } from '../../../../logging-service';
import { LyncApiGlobals } from '../../../lync-api/lync-api-globals';
import { CallViewStateMachine } from '../../call-center-call-view/call-view-state-machine';
import { ActiveCallSession } from '../../../services/active-call-session';
import { CallSessionRequests, MonitoringType } from '../../../services/call-session-requests';
import { LyncApiContainer } from '../../../lync-api/lync-api-container';
import { RecordingStateChangeListener } from '../../../services/recording-state-change-listener';
import { Listeners } from '../../../services/listeners';
import { IconPathsService, IconPaths } from '../../../services/icon-paths-service';
import { DynamicsChannelIntegration, CallDirection } from '../../../services/dynamics-channel-integration';
import { CallCenterCallViewBase } from '../../component-base/callcenter-callview-base';
import { StateName } from '../../call-center-call-view/enums';
import { CallSessionTimer } from 'src/app/web-client/services/call-session-timer';
import { Subscription } from 'rxjs';
import { LastPhoneCallActivityService, LastPhoneCallActivity } from '../last-phone-call-activity.service';


@Component({
  selector: 'app-dynamics-call-view',
  templateUrl: './dynamics-call-view.component.html',
  styleUrls: ['./dynamics-call-view.component.css']
})
export class DynamicsCallViewComponent extends CallCenterCallViewBase {

  private callSessionTimerSubscription:Subscription;
  activityDescription:string;

  constructor(callSessionStateChangeListener:CallSessionStateChangeListener,
    logger:LoggingService,lyncApiGlobals:LyncApiGlobals,
    cdRef: ChangeDetectorRef,callSessionRequests:CallSessionRequests,
    activeCallSession:ActiveCallSession,apiContainer:LyncApiContainer,
    recordingStateChangedListener:RecordingStateChangeListener,callViewStateMachine:CallViewStateMachine,
    listeners:Listeners,iconPathsService:IconPathsService,private dynamicsChannelIntegration:DynamicsChannelIntegration,private callSessionTimer:CallSessionTimer,private lastPhoneCallActivityService:LastPhoneCallActivityService) {

      super(callSessionStateChangeListener,
        logger,lyncApiGlobals,
        cdRef,callSessionRequests,
        activeCallSession,apiContainer,
        recordingStateChangedListener,callViewStateMachine,
        listeners,iconPathsService);     

        this.callSessionTimer.init(1000);
        this.callSessionTimerSubscription = this.callSessionTimer.onIntervalTick.subscribe(()=>{
           this.callDuration = this.callSessionTimer.getTimeString();
        });

  }    

  callDuration:string;
 
  afterHandle()
  {
    super.afterHandle();        

    this.addCRMActivityRecord().then((activityId)=>{
      
      this.lastPhoneCallActivityService.setLastPhoneCallActivity(new LastPhoneCallActivity(activityId,this.activityDescription)); 

      this.callSessionTimer.stop();  
      this.callSessionTimer.reset();
      this.callDuration = '';

    });    
    
  }

  afterAnswer(){
    
    super.afterAnswer();

    this.activityDescription = "";
    this.currentActivityId = "";

    this.lastPhoneCallActivityService.setLastPhoneCallActivity(new LastPhoneCallActivity("",""));
    
    this.callSessionTimer.reset();
    this.callSessionTimer.start();
    

    super.afterAnswer();
    this.showContact();
  }

  afterIncomingCall(){
    
    super.afterIncomingCall();
    this.lastPhoneCallActivityService.setLastPhoneCallActivity(null);
  }

  private currentActivityId:any;

  addCRMActivityRecord():Promise<string>{
    
    return new Promise<string>((resolve,reject)=>{
      
      let defaultDescription:string = "Incoming call from : " + this.mediaModel.QueueName + "->" + this.mediaModel.CallerName;

      let desciption = (this.activityDescription && this.activityDescription.length > 0) ?
        this.activityDescription  : defaultDescription;

      let activity = {
        contactId:null,
        currentCase:null,
        description:desciption,
        direction : CallDirection.Incoming,
        name : null,
        number : "05332414505",
        userId : null
      };

      this.dynamicsChannelIntegration.createCallActivity(activity,
      r=>{
          this.currentActivityId = r.activityId;
          resolve(r.activityId);
      });


    });   
     
    

  }

  showContact() {

      this.dynamicsChannelIntegration.searchContactsAndOpen("05332414505").then(c => { });
    
  }

  ngOnDestroy(){
    super.ngOnDestroy();

    this.callSessionTimerSubscription.unsubscribe();

  }

}
