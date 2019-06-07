import { Component, ViewChild} from '@angular/core';

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
    initializeData: InitializeData,dynamicsChannelIntegration:DynamicsChannelIntegration,iconPathsService:IconPathsService){
    super(messaging,cacheService,serviceCall,logger,lyncApiGlobals,apiContainer,
      lyncSDKApi,activatedRoute,socketManager,xhrHook,initializeData,dynamicsChannelIntegration,iconPathsService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.currentTab = 'dialpad';

  }

  @ViewChild('dynamicsContactSearch',{static: false}) dynamicsContactSearch:DynamicsContactSearchComponent;
  @ViewChild('dynamicsCC4SkypeContactSearch',{static: false}) dynamicsCC4SkypeContactSearch:DynamicsCc4skypeContactSearchComponent;

  searchContacts(searchText:string)
  {
    this.dynamicsContactSearch.searchContacts(searchText);
    this.dynamicsCC4SkypeContactSearch.onSearch(searchText);
  }

}
