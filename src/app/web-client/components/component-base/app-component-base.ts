import { Component, OnInit } from '@angular/core';
import { Messaging } from '../../messaging/messaging';
import { LyncApiSignIn } from '../../lync-api/lync-api-signin';
import { LyncApi } from '../../lync-api/lync-api';
import { CacheService } from '../../services/cache-service';
import { ServiceCall } from '../../messaging/service-call';
import { LoggingService } from 'src/app/logging-service';
import { LyncApiGlobals } from '../../lync-api/lync-api-globals';
import { LyncApiContainer, LyncApiType } from '../../lync-api/lync-api-container';
import { LyncSDKApi } from '../../lync-sdk/lync-sdk-api';
import { ActivatedRoute } from '@angular/router';
import { SocketManager } from '../../messaging/socket-manager';
import { XHRHook } from '../../services/xhr-hook';
import { InitializeData } from '../../services/initialize-data';
import { DynamicsChannelIntegration } from '../../services/dynamics-channel-integration';

export class AppComponentBase implements OnInit {

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

}
