import { Component, ChangeDetectorRef } from '@angular/core';
import { CallSessionStateChangeListener } from '../../services/call-session-state-change-listener';
import { LoggingService } from '../../../logging-service';
import { LyncApiGlobals } from '../../lync-api/lync-api-globals';
import { CallViewStateMachine } from './call-view-state-machine';
import { ActiveCallSession } from '../../services/active-call-session';
import { CallSessionRequests, MonitoringType } from '../../services/call-session-requests';
import { LyncApiContainer } from '../../lync-api/lync-api-container';
import { RecordingStateChangeListener } from '../../services/recording-state-change-listener';
import { Listeners } from '../../services/listeners';
import { IconPathsService, IconPaths } from '../../services/icon-paths-service';
import { DynamicsChannelIntegration, CallDirection } from '../../services/dynamics-channel-integration';
import { CallCenterCallViewBase } from '../component-base/callcenter-callview-base';


@Component({
  selector: 'app-call-center-call-view',
  templateUrl: './call-center-call-view.component.html',
  styleUrls: ['./call-center-call-view.component.css']
})
export class CallCenterCallViewComponent extends CallCenterCallViewBase {

  
  constructor(callSessionStateChangeListener:CallSessionStateChangeListener,
    logger:LoggingService,lyncApiGlobals:LyncApiGlobals,
    cdRef: ChangeDetectorRef,callSessionRequests:CallSessionRequests,
    activeCallSession:ActiveCallSession,apiContainer:LyncApiContainer,
    recordingStateChangedListener:RecordingStateChangeListener,callViewStateMachine:CallViewStateMachine,
    listeners:Listeners,iconPathsService:IconPathsService) {

      super(callSessionStateChangeListener,
        logger,lyncApiGlobals,
        cdRef,callSessionRequests,
        activeCallSession,apiContainer,
        recordingStateChangedListener,callViewStateMachine,
        listeners,iconPathsService);     

  }  

  
  
}







