import { Component, OnInit, ViewChild } from '@angular/core';
import { DynamicsContactSearchComponent } from '../dynamics-contact-search/dynamics-contact-search.component';
import { DynamicsCc4skypeContactSearchComponent } from '../dynamics-cc4skype-contact-search/dynamics-cc4skype-contact-search.component';

@Component({
  selector: 'app-dynamics-contacts-tab',
  templateUrl: './dynamics-contacts-tab.component.html',
  styleUrls: ['./dynamics-contacts-tab.component.css']
})
export class DynamicsContactsTabComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  @ViewChild('dynamicsContactSearch',{static: false}) dynamicsContactSearch:DynamicsContactSearchComponent;
  @ViewChild('dynamicsCC4SkypeContactSearch',{static: false}) dynamicsCC4SkypeContactSearch:DynamicsCc4skypeContactSearchComponent;

  searchContacts(searchText:string)
  {
    this.dynamicsContactSearch.searchContacts(searchText);
    this.dynamicsCC4SkypeContactSearch.onSearch(searchText);    
  }

  currentTab: string = 'dynamics';

  visibilityClass(tabName: string) {
    return this.currentTab == tabName ? 'visible' : 'invisible';
  }

  activeTabClass(tabName: string) {
    return this.currentTab == tabName ? 'active' : '';
  }

  
  showTab(tab: string) {
    this.currentTab = tab;
  }

}
