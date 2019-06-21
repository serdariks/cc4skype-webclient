import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DynamicsContactSearchComponent } from '../dynamics-contact-search/dynamics-contact-search.component';
import { DynamicsCc4skypeContactSearchComponent } from '../dynamics-cc4skype-contact-search/dynamics-cc4skype-contact-search.component';
import { CallViewStateMachine } from '../../call-center-call-view/call-view-state-machine';
import { OutBoundCallStateMachine, OutBoundCallStateName } from '../../component-base/outbound-call-state-machine';
import { Subscription } from 'rxjs';
import { StateName } from '../../call-center-call-view/enums';

@Component({
  selector: 'app-dynamics-contacts-tab',
  templateUrl: './dynamics-contacts-tab.component.html',
  styleUrls: ['./dynamics-contacts-tab.component.css']
})
export class DynamicsContactsTabComponent implements OnInit,OnDestroy {

  constructor( private callViewStateMachine:CallViewStateMachine,
    private outboundCallstateMachine:OutBoundCallStateMachine) { }

  ngOnInit() {
    this.bindCallViewStateChanged();
    this.bindOutboundCallViewStateChanged();
  }

  ngOnDestroy(){
      this.callViewStateChangedSubscription.unsubscribe();
      this.outboundCallStateChangedSubscription.unsubscribe();
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

  private callViewStateChangedSubscription:Subscription;
  
  private bindCallViewStateChanged(){

    this.callViewStateChangedSubscription = this.callViewStateMachine.stateChanged.subscribe(args=>{           
            

       let isAnswered:boolean = args.currentState.toString() == StateName[StateName.FirstNormalAgentConnected];      
    
       if(isAnswered)
       {
          this.showTab('cc4skype');
       }

    });

    

  }

  private outboundCallStateChangedSubscription:Subscription;

  private bindOutboundCallViewStateChanged(){

    this.outboundCallStateChangedSubscription = this.outboundCallstateMachine.stateChanged.subscribe(args=>{           
            

       let isAnswered:boolean = args.currentState.toString() == OutBoundCallStateName[OutBoundCallStateName.Accepted];      
      
       if(isAnswered)
       {
         this.showTab('cc4skype');
       }
       

    });

  }

}
