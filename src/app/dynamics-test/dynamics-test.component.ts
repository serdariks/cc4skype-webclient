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
  private currentCaseId:any;

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

  openCurrentCase()
  {
      this.dynamicsChannelIntegration.openCase({currentCase:this.currentCaseId});
  }

  createCaseTest(){

    this.dynamicsChannelIntegration.searchContacts("05332414505").then(contacts=>{
    
    
      if(contacts.length == 0) return;

      let caseRequest:CreateCaseRequest = {
        contactId:contacts[0].contactId,
        callNotes:"I have a few call notes about this caller"
      };

      this.dynamicsChannelIntegration.createCase(caseRequest,(result)=>{
        console.log("Case created:" + result.id + "," + result.name);
        this.currentCaseId = result.id;
      });

    });    

    

  }

  searchContactsTest()
  {
    this.dynamicsChannelIntegration.searchContacts('');
  }

}
