import { Component, ViewChild, Renderer2, Inject} from '@angular/core';

import { Messaging } from '../../../messaging/messaging';
import { LyncApiSignIn } from '../../../lync-api/lync-api-signin';
import { LyncApi } from '../../../lync-api/lync-api';
import { CacheService } from '../../../services/cache-service';
import { ServiceCall } from '../../../messaging/service-call';
import { LoggingService } from 'src/app/logging-service';
import { LyncApiGlobals } from '../../../lync-api/lync-api-globals';
import { LyncApiContainer, LyncApiType } from '../../../lync-api/lync-api-container';
import { LyncSDKApi } from '../../../lync-sdk/lync-sdk-api';
import { ActivatedRoute } from '@angular/router';
import { SocketManager } from '../../../messaging/socket-manager';
import { XHRHook } from '../../../services/xhr-hook';
import { InitializeData } from '../../../services/initialize-data';
import { DynamicsChannelIntegration } from '../../../services/dynamics-channel-integration';
import { AppComponentBase } from '../../component-base/app-component-base';
import { IconPathsService } from 'src/app/web-client/services/icon-paths-service';
import { DynamicsContactSearchComponent } from '../dynamics-contact-search/dynamics-contact-search.component';
import { DynamicsCc4skypeContactSearchComponent } from '../dynamics-cc4skype-contact-search/dynamics-cc4skype-contact-search.component';
import { CallViewStateMachine } from '../../call-center-call-view/call-view-state-machine';
import { Subscription } from 'rxjs';
import { StateName } from '../../call-center-call-view/enums';
import { OutBoundCallStateMachine, OutBoundCallStateName } from '../../component-base/outbound-call-state-machine';
//import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-dynamics-app',
  templateUrl: './dynamics-app.component.html',
  styleUrls: ['./dynamics-app.component.css']
})
export class DynamicsAppComponent extends AppComponentBase { 
  constructor(messaging: Messaging, cacheService: CacheService, serviceCall: ServiceCall,
    logger: LoggingService, lyncApiGlobals: LyncApiGlobals,apiContainer: LyncApiContainer
    , lyncSDKApi: LyncSDKApi, activatedRoute: ActivatedRoute, socketManager: SocketManager, 
    xhrHook: XHRHook,
    initializeData: InitializeData,dynamicsChannelIntegration:DynamicsChannelIntegration,iconPathsService:IconPathsService, 
    private callViewStateMachine:CallViewStateMachine,
    private outboundCallstateMachine:OutBoundCallStateMachine,
    //private renderer2: Renderer2,@Inject(DOCUMENT) private _document
    ){
    super(messaging,cacheService,serviceCall,logger,lyncApiGlobals,apiContainer,
      lyncSDKApi,activatedRoute,socketManager,xhrHook,initializeData,dynamicsChannelIntegration,iconPathsService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.currentTab = 'dialpad';
    this.bindCallViewStateChanged();
    this.bindOutboundCallViewStateChanged();

    //this.loadDynamicsScript();

    //this.runningAsDynamicsWidget = this.dynamicsBaseUrl.length > 0;

  }

  ngOnDestroy()
  {
    super.ngOnDestroy();

    this.callViewStateChangedSubscription.unsubscribe();
    this.outboundCallStateChangedSubscription.unsubscribe();
  }

  private callViewStateChangedSubscription:Subscription;
  
  private bindCallViewStateChanged(){

    this.callViewStateChangedSubscription = this.callViewStateMachine.stateChanged.subscribe(args=>{           
            

       let isAnswered:boolean = args.currentState.toString() == StateName[StateName.FirstNormalAgentConnected];      
    
       if(isAnswered)
       {
          this.showTab('contacts');
       }

       let isHandled:boolean = 
       (
         args.previousState.toString() == StateName[StateName.FirstNormalAgentConnected] 
         || 
         args.previousState.toString() == StateName[StateName.WarmInviteAcceptedFirstAgent]
       )&&
       args.currentState.toString() == StateName[StateName.OffHook];      

      if(isHandled){
        this.showTab('dialpad');
        
      }

    });

    

  }

  private outboundCallStateChangedSubscription:Subscription;

  private bindOutboundCallViewStateChanged(){

    this.outboundCallStateChangedSubscription = this.outboundCallstateMachine.stateChanged.subscribe(args=>{           
            

       let isAnswered:boolean = args.currentState.toString() == OutBoundCallStateName[OutBoundCallStateName.Accepted];      
      
       if(isAnswered)
       {
         this.showTab('contacts');
       }


       let isHandled:boolean = 
       (
         args.previousState.toString() == OutBoundCallStateName[OutBoundCallStateName.Accepted] 
         || 
         args.previousState.toString() == OutBoundCallStateName[OutBoundCallStateName.WarmInviteAcceptedFirstAgent]
       )&&
       args.currentState.toString() == OutBoundCallStateName[OutBoundCallStateName.OffHook];      

      if(isHandled){
        this.showTab('dialpad');
       
      }
       

    });

  }

 /*  loadDynamicsScript(){
    const s = this.renderer2.createElement('script');
    s.type = 'text/javascript';
    s.onload = this.loadNextScript.bind(this);
    s.src = this.dynamicsScriptPath;
    s.text = ``;
    this.renderer2.appendChild(this._document.body, s);
  }

  loadNextScript() {
    const s = this.renderer2.createElement('script');
    s.text = `
      ciLoaded=true;
    `;
    this.renderer2.appendChild(this._document.body, s);
 } */

  /* @ViewChild('dynamicsContactSearch',{static: false}) dynamicsContactSearch:DynamicsContactSearchComponent;
  @ViewChild('dynamicsCC4SkypeContactSearch',{static: false}) dynamicsCC4SkypeContactSearch:DynamicsCc4skypeContactSearchComponent;

  searchContacts(searchText:string)
  {
    this.dynamicsContactSearch.searchContacts(searchText);
    this.dynamicsCC4SkypeContactSearch.onSearch(searchText);    
  } */

 /*  runningAsDynamicsWidget:boolean = false;

  get dynamicsBaseUrl():string{

    let args:string[] = window.location.search.substr(1).split('&');

    let baseUrlArg = args.map(a=>{
      let argParts = a.split('=');
      return {key:argParts[0],value:argParts[1]};
    }).find(a=>a.key == 'base');

    return baseUrlArg ? baseUrlArg.value : '';      

  }

  dynamicsScriptPath:string = this.dynamicsBaseUrl + "/webresources/Widget/msdyn_ciLibrary.js"; */
  

}
