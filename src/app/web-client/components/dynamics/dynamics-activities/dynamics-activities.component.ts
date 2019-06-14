import { Component, OnInit } from '@angular/core';
import { DynamicsChannelIntegration, DynamicsActivity } from 'src/app/web-client/services/dynamics-channel-integration';

@Component({
  selector: 'app-dynamics-activities',
  templateUrl: './dynamics-activities.component.html',
  styleUrls: ['./dynamics-activities.component.css']
})
export class DynamicsActivitiesComponent implements OnInit {

  constructor(private dynamicsChannelIntegration:DynamicsChannelIntegration) { }
  
  activities:DynamicsActivity[] = [];

  ngOnInit() {

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

}
