import { Component} from '@angular/core';
import { Listeners } from '../../../services/listeners';
import { LoggingService } from '../../../../logging-service';
import { OutBoundCallStateMachine, OutBoundCallStateName } from '../../component-base/outbound-call-state-machine';
import { IconPathsService, IconPaths } from '../../../services/icon-paths-service';
import { LyncApiContainer } from '../../../lync-api/lync-api-container';
import { ActiveCallSession } from '../../../services/active-call-session';
import { CallSessionRequests } from '../../../services/call-session-requests';
import { RecordingStateChangeListener } from '../../../services/recording-state-change-listener';
import { LyncApiGlobals } from '../../../lync-api/lync-api-globals';
import { OutboundCallViewBase } from '../../component-base/outbound-callview-base';
import { CallDirection, DynamicsChannelIntegration } from 'src/app/web-client/services/dynamics-channel-integration';

@Component({
  selector: 'app-dynamics-outbound-call-view',
  templateUrl: './dynamics-outbound-call-view.component.html',
  styleUrls: ['./dynamics-outbound-call-view.component.css']
})
export class DynamicsOutboundCallViewComponent extends OutboundCallViewBase {
  
  constructor(listeners:Listeners,logger:LoggingService,stateMachine:OutBoundCallStateMachine,
    iconPathsService:IconPathsService,apiContainer:LyncApiContainer,activeCallSession:ActiveCallSession,
    callSessionRequests:CallSessionRequests,recordingStateChangedListener:RecordingStateChangeListener,lyncApiGlobals:LyncApiGlobals,private dynamicsChannelIntegration:DynamicsChannelIntegration) {

    super(listeners,logger,stateMachine,
      iconPathsService,apiContainer,activeCallSession,
      callSessionRequests,recordingStateChangedListener,lyncApiGlobals)
  }    

  afterHandle(){
    super.afterHandle();
    this.addCRMActivityRecord();
  }

  afterAnswer(){
    super.afterAnswer();
    this.showContact();
  }

  private currentActivityId:any;

  addCRMActivityRecord(){
    
    
     let activity = {
        contactId:null,
        currentCase:null,
        description:"Activity record for outgoing call: " + this.lastModel.QueueName + "->" + this.lastModel.CalledAgentSIP,
        direction : CallDirection.Outgoing,
        name : null,
        number : this.lastModel.CalledAgentSIP,
        userId : null
      };

      this.dynamicsChannelIntegration.createCallActivity(activity,
      r=>{
          this.currentActivityId = r.activityId;
      });
    

  }

  showContact() {

      this.dynamicsChannelIntegration.searchContactsAndOpen(this.lastModel.CalledAgentSIP).then(c => { });
    
  }

}
