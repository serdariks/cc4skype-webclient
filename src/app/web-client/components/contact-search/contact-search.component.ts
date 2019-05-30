import { Component } from '@angular/core';
import { ServiceCall } from '../../messaging/service-call';
import { LoggingService } from '../../../logging-service';
import { CallSessionRequests } from '../../services/call-session-requests';
import { LyncApiContainer } from '../../lync-api/lync-api-container';
import { Globals } from '../../services/globals';
import { CallViewStateMachine } from '../call-center-call-view/call-view-state-machine';
import { CallSessionStateChangeListener } from '../../services/call-session-state-change-listener';
import { OutBoundCallStateMachine, OutBoundCallStateName } from '../component-base/outbound-call-state-machine';
import { Listeners } from '../../services/listeners';
import { UserInitializeData, UserData, Roles, UserRole } from '../../services/user-initialize-data';
import { ContactSearchBase } from '../component-base/contact-search-base';

@Component({
  selector: 'app-contact-search',
  templateUrl: './contact-search.component.html',
  styleUrls: ['./contact-search.component.css']
})
export class ContactSearchComponent extends ContactSearchBase {

  constructor(serviceCall:ServiceCall,logger:LoggingService,callSessionRequests:CallSessionRequests,
    apiContainer:LyncApiContainer,globals:Globals,callViewStateMachine:CallViewStateMachine,
    callSessionStateChangeListener:CallSessionStateChangeListener,outboundCallStateMachine:OutBoundCallStateMachine,
    listeners:Listeners,userInitializeData:UserInitializeData){

      super(serviceCall,logger,callSessionRequests,
        apiContainer,globals,callViewStateMachine,
        callSessionStateChangeListener,outboundCallStateMachine,
        listeners,userInitializeData);

  }

}
