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
      this.dynamicsChannelIntegration.createCallActivity({
        contactId:"contactId1",
        currentCase:"caseId1",
        description:"description1",
        direction : CallDirection.Incoming,
        name : "Name1",
        number : "123456",
        userId : "userId1"
      },
      r=>{
          
      });
  }

}
