import { Component} from '@angular/core';

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
import { AppComponentBase } from '../component-base/app-component-base';

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
    initializeData: InitializeData,dynamicsChannelIntegration:DynamicsChannelIntegration){
    super(messaging,cacheService,serviceCall,logger,lyncApiGlobals,apiContainer,
      lyncSDKApi,activatedRoute,socketManager,xhrHook,initializeData,dynamicsChannelIntegration);
  }
}
