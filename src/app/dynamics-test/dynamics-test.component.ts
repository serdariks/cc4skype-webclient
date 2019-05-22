import { Component, OnInit } from '@angular/core';
import { DynamicsChannelIntegration, CallActivity, CallDirection } from '../web-client/services/dynamics-channel-integration';

@Component({
  selector: 'app-dynamics-test',
  templateUrl: './dynamics-test.component.html',
  styleUrls: ['./dynamics-test.component.css']
})
export class DynamicsTestComponent implements OnInit {

  constructor(private dynamicsChannelIntegration:DynamicsChannelIntegration) { }

  ngOnInit() {
  }

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
          
      });
  }

  searchContactsTest()
  {
    this.dynamicsChannelIntegration.searchContacts();
  }

}
