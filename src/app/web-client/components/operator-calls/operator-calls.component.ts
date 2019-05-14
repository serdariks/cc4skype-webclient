import { Component, OnInit } from '@angular/core';
import { Listeners } from '../../services/listeners';
import { Listener } from '../../services/listener';
import { LoggingService } from '../../../logging-service';
import { CallSessionRequests } from '../../services/call-session-requests';
import { LyncApiContainer } from '../../lync-api/lync-api-container';
import { LyncApiAudioService } from '../../lync-api/lync-api-audio-service';

@Component({
  selector: 'app-operator-calls',
  templateUrl: './operator-calls.component.html',
  styleUrls: ['./operator-calls.component.css']
})
export class OperatorCallsComponent implements OnInit {

  private operatorCallsListener:Listener<any>;

  operatorCalls:any[]=[];

  private lyncApiAudioService:LyncApiAudioService;
  
  constructor(private listeners:Listeners,private logger:LoggingService,private callSessionRequests:CallSessionRequests,private apiContainer:LyncApiContainer) {

    this.operatorCallsListener = listeners.createListener('UpdateOperatorCall');  
    this.lyncApiAudioService = apiContainer.currentApi.audioService;        

  }

  ngOnInit() 
  {
    
    this.operatorCallsListener.received.subscribe(operatorCallUpdate=>{  

        this.logger.log(`OperatorCallUpdate:${JSON.stringify(operatorCallUpdate)}`);    
        
        this.processOperatorCallUpdate(operatorCallUpdate);

    });    

  }

  processOperatorCallUpdate(operatorCallUpdate:any){

    let updateType:string = operatorCallUpdate.updateTypeAsString;

    let model = operatorCallUpdate.waitingMedia;

    let existingCallIndex = this.operatorCalls.findIndex(c=>c.SessionID == model.SessionID);

    if(existingCallIndex > -1 && updateType == 'Update'){
      
      this.operatorCalls.splice(existingCallIndex,1,model);
    }
    if(existingCallIndex > -1 && updateType == 'Delete'){
      
      this.operatorCalls.splice(existingCallIndex,1);
    }
    else if(existingCallIndex < 0 && updateType == 'Add')
    {
      this.operatorCalls.push(model);
    }    

  }

  isParked(operatorCall:any)
  {
    return operatorCall.OperatorCallStateAsString == 'Parked';
  }
  isFallBack(operatorCall:any){
    return operatorCall.OperatorCallStateAsString == 'FallBack';
  }

  onReJoin(operatorCall:any){

      this.callSessionRequests.startRejoinCall(operatorCall.ConversationKey,operatorCall.SessionID).then(result=>{

        this.callSessionRequests.getDNISBySessionId(operatorCall.SessionID).then(dnis=>{

          this.lyncApiAudioService.call(dnis);

        });

      });

  }

}
