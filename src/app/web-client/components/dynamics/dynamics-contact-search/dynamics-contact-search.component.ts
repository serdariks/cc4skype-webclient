import { Component, OnInit } from '@angular/core';
import { DynamicsChannelIntegration, DynamicsContact } from 'src/app/web-client/services/dynamics-channel-integration';
import { IconPathsService, IconPaths } from 'src/app/web-client/services/icon-paths-service';
import { OutboundCall } from 'src/app/web-client/services/outbound-call';

@Component({
  selector: 'app-dynamics-contact-search',
  templateUrl: './dynamics-contact-search.component.html',
  styleUrls: ['./dynamics-contact-search.component.css']
})
export class DynamicsContactSearchComponent implements OnInit {

  constructor(private dynamicsService:DynamicsChannelIntegration,private iconPathsService:IconPathsService,private outBoundCall:OutboundCall) {

  }

  iconPaths:IconPaths = this.iconPathsService.iconPaths;

  ngOnInit() {
    this.addTestContacts();
    this.searchContacts('');
  }

  contacts:DynamicsContact[] = [];
  testContacts:DynamicsContact[] = [];

  private addTestContacts(){  
    
    this.testContacts.push({fullName:'Mathieu Van Heijs',mobilePhone:'05372414505',contactId:'1'});
    this.testContacts.push({fullName:'Sahin Deligöz',mobilePhone:'05332434303',contactId:'2'});
    this.testContacts.push({fullName:'Gertjan Coolen',mobilePhone:'05331111111',contactId:'3'});
  }

  searchContacts(keyword:string){

    /*this.contacts = this.testContacts.filter(c=>
      c.fullName.toLocaleLowerCase().indexOf(keyword.toLowerCase())>=0 || 
      c.mobilePhone.indexOf(keyword)>=0);*/

    this.dynamicsService.searchContacts(keyword).then(contacts=>{
      this.contacts = contacts;
    });
  }

  onDialClick(mobilePhone:string){
    console.log('calling ' + mobilePhone);
    this.startOutBoundCall(mobilePhone);
  }

  startOutBoundCall(mobilePhone:string){
   
    this.outBoundCall.start(mobilePhone).then((result)=>{
          
      //this.logger.log(`dtmf-menu. outbound-call result: ${result}`);
    });
    
  }

}
