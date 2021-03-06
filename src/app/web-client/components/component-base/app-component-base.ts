import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { IconPathsService, IconPaths } from '../../services/icon-paths-service';
import { Subscription } from 'rxjs';

export class AppComponentBase implements OnInit,OnDestroy {

  private lyncApiSignIn: LyncApiSignIn;
  private lyncApi: LyncApi;
  iconPaths:IconPaths = this.iconPathsService.iconPaths;

  constructor(private messaging: Messaging, private cacheService: CacheService, private serviceCall: ServiceCall,
    private logger: LoggingService, private lyncApiGlobals: LyncApiGlobals, private apiContainer: LyncApiContainer
    , private lyncSDKApi: LyncSDKApi, private activatedRoute: ActivatedRoute, private socketManager: SocketManager, 
    private xhrHook: XHRHook,
    private initializeData: InitializeData,private dynamicsChannelIntegration:DynamicsChannelIntegration, private iconPathsService:IconPathsService) {

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

  //personLoggedIn: any;

  messagingInitializeSubscription:Subscription;
  userSignedInSubscription:Subscription;
  lyncApiSignInSubscription:Subscription;

  ngOnInit(): void {

    this.cacheService.initialize();

    this.messagingInitializeSubscription = this.messaging.initialized.subscribe(() => {
      this.afterMessagingInitialize();
    });

    this.messaging.initialize();

    this.userSignedInSubscription = this.lyncApiSignIn.userSignedIn.subscribe(() => {
      this.userSignedIn = true;
    });

    this.lyncApiSignInSubscription = this.lyncApiSignIn.userSignedOut.subscribe(() => {
      this.userSignedIn = false;
    });   

  }

  ngOnDestroy(){

      this.messagingInitializeSubscription.unsubscribe();
      this.userSignedInSubscription.unsubscribe();
      this.lyncApiSignInSubscription.unsubscribe();
  }

  afterMessagingInitialize() {
    this.initializeData.initialize();
  }  
  
  dialpadIsOpen:boolean = false;

  onDialpadClick(){
    this.dialpadIsOpen = !this.dialpadIsOpen;
  }

  onOutboundCallStarted(){
    this.dialpadIsOpen = false;
  }

}
