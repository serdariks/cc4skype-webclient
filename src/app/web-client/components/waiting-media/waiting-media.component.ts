import { Component, OnInit, OnDestroy } from '@angular/core';
import { Listeners } from '../../services/listeners';
import { Listener } from '../../services/listener';
import { LoggingService } from '../../../logging-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-waiting-media',
  templateUrl: './waiting-media.component.html',
  styleUrls: ['./waiting-media.component.css']
})
export class WaitingMediaComponent implements OnInit,OnDestroy {

  private waitingMediaChangeListener:Listener<any>;
  
  constructor(listeners:Listeners,private logger:LoggingService) {

    this.waitingMediaChangeListener = listeners.createListener<any>("WaitingMediaChange");
  }

  list:any[] = [];

  ngOnInit() {

    this.bindWaitingMediaChangeListener();

  }

  ngOnDestroy(){
    this.waitingMediaChangedSubscription.unsubscribe();
  }

  private waitingMediaChangedSubscription:Subscription;

  private bindWaitingMediaChangeListener(){

    this.waitingMediaChangedSubscription = this.waitingMediaChangeListener.received.subscribe(model=>{

      this.logger.log(`waiting-media-component. waiting media change:${JSON.stringify(model)}`);

      this.processWaitingMediaChange(model);

    });
  }

  private processWaitingMediaChange(model:any){

    model.WaitingMedia.Status = model.WaitingMedia.IsAssigned ? 'Offering' : '';

    if(model.changeType == 'Added' && this.list.findIndex(i=>i.SessionID == model.WaitingMedia.SessionID) < 0){

      this.list.push(model.WaitingMedia);
    }
    else if(model.changeType == 'Updated')
    {
      let existingWaitingMediaIndex = this.list.findIndex(i=>i.SessionID == model.WaitingMedia.SessionID);                

      if(existingWaitingMediaIndex >=0){

        this.list.splice(existingWaitingMediaIndex,1,model.WaitingMedia);
      }

    }
    else if(model.changeType == 'Removed')
    {
      let existingWaitingMediaIndex = this.list.findIndex(i=>i.SessionID == model.WaitingMedia.SessionID);                

      if(existingWaitingMediaIndex >=0){

        this.list.splice(existingWaitingMediaIndex,1);
      }

    }

  }

}
