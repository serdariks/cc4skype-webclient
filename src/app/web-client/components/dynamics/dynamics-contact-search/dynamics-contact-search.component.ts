import { Component, OnInit } from '@angular/core';
import { DynamicsChannelIntegration, DynamicsContact } from 'src/app/web-client/services/dynamics-channel-integration';
import { IconPathsService, IconPaths } from 'src/app/web-client/services/icon-paths-service';

@Component({
  selector: 'app-dynamics-contact-search',
  templateUrl: './dynamics-contact-search.component.html',
  styleUrls: ['./dynamics-contact-search.component.css']
})
export class DynamicsContactSearchComponent implements OnInit {

  constructor(private dynamicsService:DynamicsChannelIntegration,private iconPathsService:IconPathsService) {

  }

  iconPaths:IconPaths = this.iconPathsService.iconPaths;

  ngOnInit() {
    
  }

  contacts:DynamicsContact[];

  searchContacts(keyword:string){
    this.dynamicsService.searchContacts(keyword).then(contacts=>{
      this.contacts = contacts;
    });
  }

  onDialClick(mobilePhone:string){
    console.log('calling ' + mobilePhone);
  }

}
