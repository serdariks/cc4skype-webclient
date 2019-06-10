import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { LyncApiContainer } from '../../lync-api/lync-api-container';
import { LyncApiAudioService } from '../../lync-api/lync-api-audio-service';
import { OutboundCall } from '../../services/outbound-call';
import { LoggingService } from '../../../logging-service';
import { IconPathsService, IconPaths } from '../../services/icon-paths-service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-dtmf-menu',
  templateUrl: './dtmf-menu.component.html',
  styleUrls: ['./dtmf-menu.component.css']
})
export class DtmfMenuComponent implements OnInit,OnDestroy {

  @Output() outboundCallStarted = new EventEmitter<string>();
  private lyncApiAudioService:LyncApiAudioService;

  constructor(private apiContainer:LyncApiContainer,private outBoundCall:OutboundCall,private logger:LoggingService,private iconPathsService:IconPathsService) { 

    this.lyncApiAudioService = apiContainer.currentApi.audioService;
  }

  dtmfMenuItems:string[] = new Array<string>();

  isOutboundCallAvailable:boolean=true;

  iconPaths:IconPaths = this.iconPathsService.iconPaths;

  private callStateChangedSubscription:Subscription;

  ngOnInit() {
     for(let i:number =0;i<10;i++){

      this.dtmfMenuItems.push(i.toString());

     }

     this.dtmfMenuItems.push('#');
     this.dtmfMenuItems.push('*');     

     this.callStateChangedSubscription = this.lyncApiAudioService.callStateChanged.subscribe(s=>{
         this.isOutboundCallAvailable = (s.state == 'Disconnected' || s.state == 'ConversationDisconnected');
         //this.logger.log(`dtmf-menu, s.state:${s.state} this.isOutboundCallAvailable:${this.isOutboundCallAvailable}`);
     });
  }

  ngOnDestroy()
  {
    this.callStateChangedSubscription.unsubscribe();
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
    this.outboundCallStarted.next();
    this.outBoundCall.start(this.digits).then((result)=>{
          
      this.logger.log(`dtmf-menu. outbound-call result: ${result}`);
    });

    this.digits = "";
  }
}
