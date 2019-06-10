import { Component, OnInit, OnDestroy } from '@angular/core';
import { LastPhoneCallActivityService, LastPhoneCallActivity } from '../last-phone-call-activity.service';
import { Subscription } from 'rxjs';
import { DynamicsChannelIntegration, UpdateActivityRequest } from 'src/app/web-client/services/dynamics-channel-integration';

@Component({
  selector: 'app-dynamics-last-activity-update',
  templateUrl: './dynamics-last-activity-update.component.html',
  styleUrls: ['./dynamics-last-activity-update.component.css']
})
export class DynamicsLastActivityUpdateComponent implements OnInit,OnDestroy {

  inUpdateMode:boolean = false;
  activityDescription:string;

  constructor(private lastPhoneCallActivityService:LastPhoneCallActivityService,private dynamicsChannelIntegration:DynamicsChannelIntegration) { }

  private lastPhoneCallActivityChangedSubscription:Subscription;
  private lastActivity:LastPhoneCallActivity;  

  ngOnInit() {

    this.lastActivity = this.lastPhoneCallActivityService.lastPhoneCallActivity;
    this.activityDescription = this.lastActivity.activityDescription;
  
    this.lastPhoneCallActivityChangedSubscription = 
      this.lastPhoneCallActivityService.Changed.subscribe(a=>{
        this.lastActivity = a;
        this.activityDescription = this.lastActivity.activityDescription;
      });
  }

  ngOnDestroy(){
    this.lastPhoneCallActivityChangedSubscription.unsubscribe();
  }

  enableUpdate(){
    this.inUpdateMode = true;
  }
  disableUpdate(){
    this.inUpdateMode = false;
  }  

  onSave(){
    
    this.lastActivity.activityDescription = this.activityDescription;

    this.lastPhoneCallActivityService.setLastPhoneCallActivity(this.lastActivity)

    let req = new UpdateActivityRequest();
    req.activityId = this.lastActivity.activityId;
    req.callNotes = this.lastActivity.activityDescription;

    this.dynamicsChannelIntegration.updateActivity(req).then((activityId)=>{
      this.disableUpdate();
    });
    
  }
  onClose(){
    this.disableUpdate();
  }

}
