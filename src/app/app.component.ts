import { Component, OnInit } from '@angular/core';
import { Messaging } from './web-client/messaging/messaging';
import { CacheService } from './web-client/services/cache-service';
import { InvokeServiceArgs } from './web-client/messaging/dto/invoke-service-args';
import { ServiceCall } from './web-client/messaging/service-call';
import { LoggingService } from './logging-service';
import { LyncApiGlobals } from './web-client/lync-api/lync-api-globals';
import { LyncApiContainer, LyncApiType } from './web-client/lync-api/lync-api-container';
import { LyncApiSignIn } from './web-client/lync-api/lync-api-signin';
import { LyncSDKApi } from './web-client/lync-sdk/lync-sdk-api';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { SocketManager } from './web-client/messaging/socket-manager';
import { XHRHook } from './web-client/services/xhr-hook';
import { LyncApi } from './web-client/lync-api/lync-api';
import { InitializeData } from './web-client/services/initialize-data';
import { DynamicsChannelIntegration } from './web-client/services/dynamics-channel-integration';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  private lyncApiSignIn: LyncApiSignIn;
  private lyncApi: LyncApi;

  constructor(private messaging: Messaging, private cacheService: CacheService, private serviceCall: ServiceCall,
    private logger: LoggingService, private lyncApiGlobals: LyncApiGlobals, private apiContainer: LyncApiContainer
    , private lyncSDKApi: LyncSDKApi, private activatedRoute: ActivatedRoute, private socketManager: SocketManager, 
    private xhrHook: XHRHook,
    private initializeData: InitializeData,private dynamicsChannelIntegration:DynamicsChannelIntegration) {

    //xhrHook.addHooks();

    socketManager.userName = this.activatedRoute.snapshot.paramMap.get("id");

    if (socketManager.userName && socketManager.userName.length > 0) {
      apiContainer.setLyncAPI(LyncApiType.lyncSDK);
    }
    else 
    {
      apiContainer.setLyncAPI(LyncApiType.webSDK);
    }

    this.lyncApi = apiContainer.currentApi;

    this.lyncApiSignIn = this.lyncApi.signIn;

    /* this.activatedRoute.queryParams.subscribe((params: Params) => {
      logger.log('activated route params:' + JSON.stringify(params));
    }); */

  }

  //contacts:any=[];

  userSignedIn: boolean = false;
  currentTab: string = 'main';

  visibilityClass(tabName: string) {
    return this.currentTab == tabName ? 'visible' : 'invisible';
  }

  activeTabClass(tabName: string) {
    return this.currentTab == tabName ? 'active' : '';
  }

  checkUserSignedIn(): boolean {
    return this.lyncApiGlobals.personSignedIn ? true : false;
  }

  showTab(tab: string) {
    this.currentTab = tab;
  }

  personLoggedIn: any;

  ngOnInit(): void {

    this.cacheService.initialize();

    this.messaging.initialized.subscribe(() => {
      this.afterMessagingInitialize();
    });

    this.messaging.initialize();

    this.lyncApiSignIn.userSignedIn.subscribe(() => {
      this.userSignedIn = true;
    });
    this.lyncApiSignIn.userSignedOut.subscribe(() => {
      this.userSignedIn = false;
    });



  }

  afterMessagingInitialize() {
    this.initializeData.initialize();
  }

  /*  private someFunc(monitoringType:MonitoringType){
 
     this.logger.log('someFunc.test run:' + monitoringType);    
 
     if(monitoringType == MonitoringType.BargeIn){
       this.logger.log('Monitoring type is barge in');
     }
 
   } */

  test() {

    //this.lyncApi.note.setNote(this.lyncApiGlobals.personSignedIn,'BBBBBBBB');

    /* let aaa = MonitoringType['BargeIn']; */

    /* this.someFunc(aaa); */


    //this.onSearch('');

    /* this.lyncSDKApi.initializer.initialize();
    this.lyncSDKApi.contactsService.getAll().then(contacts=>{

      this.logger.log(`testClientHost:contacts:${JSON.stringify(contacts)}`);

    }); */

    /* let requestData =  {};    
    
  
    let args:InvokeServiceArgs={
      
      targetService : `webClientHost_${this.lyncApiGlobals.clientSip}`,
      operation : "Test",      
      requestData : null,

      responseHandler : {
  
        success:(result)=>{          
          
          this.logger.log(`Client host test result:${result}`);
        }
        ,
        error:(err)=>{
          this.logger.log(err);
        }
  
      }
    };
  
    this.serviceCall.invokeService(args); */

  }

  resultList: any[] = [];

  onSearch(searchInput: string) {

    this.resultList = [];

    let requestData = { Keyword: searchInput }

    let args: InvokeServiceArgs = {

      targetRooms: ['CC4Skype.CallCenterService_CC4SKYPE-SERVER.cc4skype.local_1']
      ,
      operation: "FilterContactsViaLucene",

      requestData: requestData,

      responseHandler: {

        success: (result) => {

          this.logger.log('FilterContactsViaLucene response received: ' + JSON.stringify(result));

          this.resultList = result.ResultList;

        }
        ,
        error: (err) => {
          this.logger.log(err);
        }

      }
    };

    this.serviceCall.invokeService(args);

  }



}
