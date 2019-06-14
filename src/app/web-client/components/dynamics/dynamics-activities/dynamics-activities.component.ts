import { Component, OnInit } from '@angular/core';
import { DynamicsChannelIntegration, DynamicsActivity } from 'src/app/web-client/services/dynamics-channel-integration';
import { IconPathsService, IconPaths } from 'src/app/web-client/services/icon-paths-service';

@Component({
  selector: 'app-dynamics-activities',
  templateUrl: './dynamics-activities.component.html',
  styleUrls: ['./dynamics-activities.component.css']
})
export class DynamicsActivitiesComponent implements OnInit {

  iconPaths:IconPaths = { };
  
  activities:DynamicsActivity[] = [];

  constructor(private dynamicsChannelIntegration:DynamicsChannelIntegration,private iconPathsService:IconPathsService) { 
    
  } 
  

  ngOnInit() {

    this.iconPaths = this.iconPathsService.iconPaths;

    this.loadActivities();

  }

  private loadActivities(){

    this.dynamicsChannelIntegration.getPhoneCallActivities().then((activites)=>{      
      this.activities = activites;
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

}
