import { Component, OnInit } from '@angular/core';
import { LyncApiContainer } from '../../lync-api/lync-api-container';
import { LyncApiAudioService } from '../../lync-api/lync-api-audio-service';
import { OutboundCall } from '../../services/outbound-call';
import { LoggingService } from '../../../logging-service';

@Component({
  selector: 'app-dtmf-menu',
  templateUrl: './dtmf-menu.component.html',
  styleUrls: ['./dtmf-menu.component.css']
})
export class DtmfMenuComponent implements OnInit {

  private lyncApiAudioService:LyncApiAudioService;

  constructor(private apiContainer:LyncApiContainer,private outBoundCall:OutboundCall,private logger:LoggingService) { 

    this.lyncApiAudioService = apiContainer.currentApi.audioService;
  }

  dtmfMenuItems:string[] = new Array<string>();

  isOutboundCallAvailable:boolean=true;

  ngOnInit() {
     for(let i:number =0;i<10;i++){

      this.dtmfMenuItems.push(i.toString());

     }

     this.dtmfMenuItems.push('#');
     this.dtmfMenuItems.push('*');     

     this.lyncApiAudioService.callStateChanged.subscribe(s=>{
         this.isOutboundCallAvailable = (s.state == 'Disconnected' || s.state == 'ConversationDisconnected');
         //this.logger.log(`dtmf-menu, s.state:${s.state} this.isOutboundCallAvailable:${this.isOutboundCallAvailable}`);
     });
  }

  onToneClick(dtmfMenuItem: string) {
    this.digits = this.digits + dtmfMenuItem;

    if (this.lyncApiAudioService.hasActiveCall()) 
    {
      this.lyncApiAudioService.sendDTMF(dtmfMenuItem);
    }
    else 
    {
        //then there's not an active call and we are gathering tones of the number that's going to be called
    }

  }
  digits:string='';
 
  startOutBoundCall(){
    this.outBoundCall.start(this.digits).then((result)=>{
          
      this.logger.log(`dtmf-menu. outbound-call result: ${result}`);
    });
  }
}
