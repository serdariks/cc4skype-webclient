import { Component} from '@angular/core';
import { Messaging } from './web-client/messaging/messaging';
import { CacheService } from './web-client/services/cache-service';
import { ServiceCall } from './web-client/messaging/service-call';
import { LoggingService } from './logging-service';
import { LyncApiGlobals } from './web-client/lync-api/lync-api-globals';
import { LyncApiContainer, LyncApiType } from './web-client/lync-api/lync-api-container';
import { LyncSDKApi } from './web-client/lync-sdk/lync-sdk-api';
import { ActivatedRoute} from '@angular/router';
import { SocketManager } from './web-client/messaging/socket-manager';
import { XHRHook } from './web-client/services/xhr-hook';
import { InitializeData } from './web-client/services/initialize-data';
import { DynamicsChannelIntegration } from './web-client/services/dynamics-channel-integration';
import { AppComponentBase } from './web-client/components/component-base/app-component-base';
import { IconPathsService } from './web-client/services/icon-paths-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent extends AppComponentBase {
 

  constructor(messaging: Messaging, cacheService: CacheService, serviceCall: ServiceCall,
    logger: LoggingService, lyncApiGlobals: LyncApiGlobals,apiContainer: LyncApiContainer
    , lyncSDKApi: LyncSDKApi, activatedRoute: ActivatedRoute, socketManager: SocketManager, 
    xhrHook: XHRHook,
    initializeData: InitializeData,dynamicsChannelIntegration:DynamicsChannelIntegration,iconPathsService:IconPathsService){
    super(messaging,cacheService,serviceCall,logger,lyncApiGlobals,apiContainer,
      lyncSDKApi,activatedRoute,socketManager,xhrHook,initializeData,dynamicsChannelIntegration,iconPathsService);
  }  

}
