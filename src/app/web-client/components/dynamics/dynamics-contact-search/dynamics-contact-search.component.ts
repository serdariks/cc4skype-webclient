import { Component, OnInit } from '@angular/core';
import { DynamicsChannelIntegration, DynamicsContact } from 'src/app/web-client/services/dynamics-channel-integration';

@Component({
  selector: 'app-dynamics-contact-search',
  templateUrl: './dynamics-contact-search.component.html',
  styleUrls: ['./dynamics-contact-search.component.css']
})
export class DynamicsContactSearchComponent implements OnInit {

  constructor(private dynamicsService:DynamicsChannelIntegration) {

  }

  ngOnInit() {
    
  }

  contacts:DynamicsContact[];

  searchContacts(keyword:string){
    this.dynamicsService.searchContacts(keyword).then(contacts=>{
      this.contacts = contacts;
    });
  }

}
