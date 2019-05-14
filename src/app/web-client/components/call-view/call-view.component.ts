import { Component, OnInit } from '@angular/core';
import { LoggingService } from '../../../logging-service';
import { LyncApiContainer } from '../../lync-api/lync-api-container';
import { LyncApiAudioService } from '../../lync-api/lync-api-audio-service';
import { Person } from '../../lync-api/lync-api-person';

@Component({
  selector: 'app-call-view',
  templateUrl: './call-view.component.html',
  styleUrls: ['./call-view.component.css']
})
export class CallViewComponent implements OnInit {

  private lyncApiAudioService:LyncApiAudioService;

  constructor(private loggingService:LoggingService,private apiContainer:LyncApiContainer) {

    this.lyncApiAudioService = apiContainer.currentApi.audioService;

  }

  currentState:{state:any,person1:Person,person2:Person};  
  
  callDirection:CallDirectionType = CallDirectionType.None;

  ngOnInit() {    
    
    this.loggingService.log('call-view. on init called!!!');

    this.lyncApiAudioService.callStateChanged.subscribe((s)=>{

      this.currentState = s;

      if(s.state == 'Connecting')
      {
        this.callDirection = CallDirectionType.Outgoing;
      }
      else if(s.state== 'Notified')
      {
        this.callDirection = CallDirectionType.Incoming;
      }
      else if(s.state == 'Disconnected' || s.state == 'ConversationDisconnected')
      {
        this.callDirection = CallDirectionType.None;
      }   
      
      this.hasActiveCall = this.callDirection!=CallDirectionType.None;

      this.loggingService.log('call-view. state change:' + s.state);
      
    });
   
  }

  onAcceptCall(){

    this.lyncApiAudioService.acceptCall().then(r=>{
      this.loggingService.log('after accept');
    });

  }

  onRejectCall(){
    this.lyncApiAudioService.rejectCall().then(r=>{
      this.loggingService.log('after reject');
    });
  }

  onHangupCall(){

    this.lyncApiAudioService.hangUp().then(r=>{
      this.loggingService.log('after hangup');
    });
  }

  onCancelCall()
  {
    this.lyncApiAudioService.hangUp().then(r=>{
      this.loggingService.log('after cancel');
    });
  }

  isRinging():boolean
  {
    return this.currentState && this.currentState.state == 'Notified';
  }
  isConnected():boolean
  {
    return this.currentState && this.currentState.state == 'Connected';
  }
  isConnecting():boolean{
    return this.currentState && this.currentState.state == 'Connecting';
  }
  isIncoming():boolean{
    return this.callDirection == CallDirectionType.Incoming;
  }
  isOutgoing():boolean{
    return this.callDirection == CallDirectionType.Outgoing;
  }

  hasPerson1():boolean{
    return this.currentState && this.currentState.person1!=null && this.currentState.person1!=undefined;
  }

  hasPerson2():boolean{
    return this.currentState && this.currentState.person2!=null && this.currentState.person2!=undefined;
  }

  hasActiveCall:boolean;      

}

export enum CallDirectionType{
  None,
  Incoming,
  Outgoing,
}
