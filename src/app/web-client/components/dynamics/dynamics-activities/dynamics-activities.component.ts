import { Component, OnInit } from '@angular/core';
import { DynamicsChannelIntegration, DynamicsActivity } from 'src/app/web-client/services/dynamics-channel-integration';
import { IconPathsService, IconPaths } from 'src/app/web-client/services/icon-paths-service';
import { OutboundCall } from 'src/app/web-client/services/outbound-call';

@Component({
  selector: 'app-dynamics-activities',
  templateUrl: './dynamics-activities.component.html',
  styleUrls: ['./dynamics-activities.component.css']
})
export class DynamicsActivitiesComponent implements OnInit {

  iconPaths:IconPaths = { };
  
  activities:DynamicsActivity[] = [];

  constructor(private dynamicsChannelIntegration:DynamicsChannelIntegration,private iconPathsService:IconPathsService,private outboundCall:OutboundCall) { 
    
  } 
  

  ngOnInit() {

    this.iconPaths = this.iconPathsService.iconPaths;

    this.loadActivities();

  }

  private loadActivities(){

    this.activities = [];

    this.dynamicsChannelIntegration.getPhoneCallActivities().then((activites)=>{      
      this.activities = activites.sort((a1,a2)=>{
        let d1 = new Date(a1.createdon); 
        let d2 = new Date(a2.createdon);
        if (d1<d2) return 1;
        else if(d1>d2) return -1;
        else if(d1==d2) return 0;
      });
      console.log("ACTIVITIES:");
      console.log(activites);
    });
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

}
