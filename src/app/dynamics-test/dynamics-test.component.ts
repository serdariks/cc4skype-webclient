import { Component, OnInit } from '@angular/core';
import { DynamicsChannelIntegration, CallActivity, CallDirection, CreateCaseRequest } from '../web-client/services/dynamics-channel-integration';

@Component({
  selector: 'app-dynamics-test',
  templateUrl: './dynamics-test.component.html',
  styleUrls: ['./dynamics-test.component.css']
})
export class DynamicsTestComponent implements OnInit {

  constructor(private dynamicsChannelIntegration:DynamicsChannelIntegration) { }

  ngOnInit() {
  }

  private currentActivityId:any;
  addActivityTest(){

      let activity = {
        contactId:null,
        currentCase:null,
        description:"this activity added from test code",
        direction : CallDirection.Incoming,
        name : null,
        number : "05332414505",
        userId : null
      };

      this.dynamicsChannelIntegration.createCallActivity(activity,
      r=>{
          this.currentActivityId = r.activityId;
      });
  }

  openCurrentActivity()
  {
      this.dynamicsChannelIntegration.openActivity(this.currentActivityId);
  }

  createCaseTest(){

    this.dynamicsChannelIntegration.searchContactByNumber("05332414505").then(c=>{
    
      let caseRequest:CreateCaseRequest = {
        contactId:c.contactId,
        callNotes:"I have a few call notes about this caller"
      };

      this.dynamicsChannelIntegration.createCase(caseRequest,(result)=>{
        console.log("Case created:" + result.id + "," + result.name);
      });

    });    

    

  }

  searchContactsTest()
  {
    this.dynamicsChannelIntegration.searchContacts();
  }

}
