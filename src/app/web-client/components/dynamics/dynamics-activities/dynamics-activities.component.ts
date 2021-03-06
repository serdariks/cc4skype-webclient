import { Component, OnInit, OnDestroy } from '@angular/core';
import { DynamicsChannelIntegration, DynamicsActivity } from 'src/app/web-client/services/dynamics-channel-integration';
import { IconPathsService, IconPaths } from 'src/app/web-client/services/icon-paths-service';
import { OutboundCall } from 'src/app/web-client/services/outbound-call';
import { Subscription } from 'rxjs';
import { LyncApiAudioService } from 'src/app/web-client/lync-api/lync-api-audio-service';
import { LyncApiContainer } from 'src/app/web-client/lync-api/lync-api-container';

@Component({
  selector: 'app-dynamics-activities',
  templateUrl: './dynamics-activities.component.html',
  styleUrls: ['./dynamics-activities.component.css']
})
export class DynamicsActivitiesComponent implements OnInit,OnDestroy {

  iconPaths:IconPaths = { };
  
  activities:DynamicsActivity[] = [];

  private lyncApiAudioService:LyncApiAudioService;

  constructor(private dynamicsChannelIntegration:DynamicsChannelIntegration,private iconPathsService:IconPathsService,private outboundCall:OutboundCall,private apiContainer:LyncApiContainer) { 
    this.lyncApiAudioService = apiContainer.currentApi.audioService;  
  } 
  
  activityListChangedSubscription:Subscription;

  ngOnInit() {

    this.iconPaths = this.iconPathsService.iconPaths;

    this.loadActivities();

    this.activityListChangedSubscription = this.dynamicsChannelIntegration.activityListChanged.subscribe(()=>{
      this.loadActivities();
    });

    this.bindForActiveCall();

  }

  ngOnDestroy(){

    this.activityListChangedSubscription.unsubscribe();
    this.callStateChangedSubscription.unsubscribe();
    
  }

  private loadActivities(){

    this.activities = [];

    this.dynamicsChannelIntegration.getPhoneCallActivities().then((activites)=>{ 
      
      this.pageCount = ((activites.length - (activites.length % this.pageSize)) / this.pageSize) + 1;

      if (this.pageIndex>this.pageCount-1) this.pageIndex = 0;
     
      this.activities = this.paginate(activites.sort((a1,a2)=>{
        let d1 = new Date(a1.createdon); 
        let d2 = new Date(a2.createdon);
        if (d1<d2) return 1;
        else if(d1>d2) return -1;
        else if(d1==d2) return 0;
      }),this.pageSize,this.pageIndex);

      console.log("ACTIVITIES:");
      console.log(activites);
    });
  }

  paginate<T> (array:T[], page_size:number, page_number:number):T[] {    
    return array.slice(page_number * page_size, (page_number + 1) * page_size);
  }

  openActivity(activityid:string){
    this.dynamicsChannelIntegration.openActivity(activityid);
  }

  activityDirectionImgPath(activity:DynamicsActivity){
    return activity.directioncode == false ? this.iconPaths['incomingCallImg']:this.iconPaths['outgoingCallImg'];
  }

  startOutBoundCall(phoneNumber:string){
    this.outboundCall.start(phoneNumber).then((result)=>{          
     
    });
  }  
 
  pageSize:number= 5;
  pageCount:number=0;
  pageIndex:number=0;
  goNext(){
    if(!(this.pageIndex == this.pageCount-1)) {
      this.pageIndex++;
    }    

    this.loadActivities();

  }
  goPrevious(){
    
    if(!(this.pageIndex ==0)) this.pageIndex--;

    this.loadActivities();
  }

  noActiveCall:boolean=true;

  callStateChangedSubscription:Subscription;

  private bindForActiveCall(){

    this.callStateChangedSubscription = this.lyncApiAudioService.callStateChanged.subscribe(s=>{
      this.noActiveCall = (s.state == 'Disconnected' || s.state == 'ConversationDisconnected');
      //this.logger.log(`dtmf-menu, s.state:${s.state} this.isOutboundCallAvailable:${this.isOutboundCallAvailable}`);
  });
  }

}
