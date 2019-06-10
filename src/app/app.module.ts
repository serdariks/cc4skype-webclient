import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';

import { AppComponent } from './app.component';
import { ServerComponent } from './server/server.component';
import { ApplesComponent } from './apples/apples.component';
import { ServersComponent } from './servers/servers.component';
import { FormsModule } from '@angular/forms';
import { CockpitComponent } from './cockpit/cockpit.component';
import { LoggingService } from './logging-service';
import { AnotherService } from './another-service';
import { SubjectTestService } from './subject-test-service';
import { SocketManager } from './web-client/messaging/socket-manager';
import { ServiceCall } from './web-client/messaging/service-call';
import { IncomingRequests } from './web-client/messaging/incoming-requests';
import { Messaging } from './web-client/messaging/messaging';
import { WebSDKInitializer } from './web-client/web-sdk/web-sdk-initializer';
import { WebSDKGlobals } from './web-client/web-sdk/web-sdk-globals';
import { WebSDKSignIn } from './web-client/web-sdk/web-sdk-signin';
import { WebSDKContacts } from './web-client/web-sdk/web-sdk-contacts';
import { ContactsComponent } from './web-client/components/contacts/contacts/contacts.component';
import { ContactsService } from './web-client/services/contacts-service';
import { LoginViewComponent } from './web-client/components/login-view/login-view.component';
import { WebSDKAudioService } from './web-client/web-sdk/web-sdk-audio-service';
import { CallViewComponent } from './web-client/components/call-view/call-view.component';
import { LogViewComponent } from './web-client/components/log-view/log-view.component';
import { WebSDKPresence } from './web-client/web-sdk/web-sdk-presence';
import { PresenceSelectComponent } from './web-client/components/presence-select/presence-select.component';
import { Globals } from './web-client/services/globals';
import { ContactSearchComponent } from './web-client/components/contact-search/contact-search.component';
import { MeetingJoinComponent } from './web-client/components/meeting-join/meeting-join.component';
import { DtmfMenuComponent } from './web-client/components/dtmf-menu/dtmf-menu.component';
import { CacheService } from './web-client/services/cache-service';
import { LyncApiGlobals } from './web-client/lync-api/lync-api-globals';
import { WebSDKApi } from './web-client/web-sdk/web-sdk-api';
import { LyncApiContainer } from './web-client/lync-api/lync-api-container';
import { WebSDKCache } from './web-client/web-sdk/web-sdk-cache';
import { LyncSDKInitializer } from './web-client/lync-sdk/lync-sdk-initializer';
import { LyncSDKSignIn } from './web-client/lync-sdk/lync-sdk-signin';
import { LyncSDKContacts } from './web-client/lync-sdk/lync-sdk-contacts';
import { LyncSDKAudioService } from './web-client/lync-sdk/lync-sdk-audio-service';
import { LyncSDKPresence } from './web-client/lync-sdk/lync-sdk-presence';
import { LyncSDKApi } from './web-client/lync-sdk/lync-sdk-api';
import { CallSessionStateChangeListener } from './web-client/services/call-session-state-change-listener';
import { CallCenterCallViewComponent } from './web-client/components/call-center-call-view/call-center-call-view.component';
import { ActiveCallSession } from './web-client/services/active-call-session';
import { CallSessionRequests } from './web-client/services/call-session-requests';
import { Routes, RouterModule } from '@angular/router';
import { AppEntryComponent } from './app-entry/app-entry.component';
import { WebClientHostAddress } from './web-client/services/web-client-host-address';
import { RecordingStateChangeListener } from './web-client/services/recording-state-change-listener';
import { Listeners } from './web-client/services/listeners';
import { OperatorCallsComponent } from './web-client/components/operator-calls/operator-calls.component';
import { CallViewStateMachine } from './web-client/components/call-center-call-view/call-view-state-machine';
import { WaitingMediaComponent } from './web-client/components/waiting-media/waiting-media.component';
import { HandlingMediaComponent } from './web-client/components/handling-media/handling-media.component';
import { XHRHook } from './web-client/services/xhr-hook';
import { CookiesService } from './web-client/services/cookies-service';
import { WebSDKNote } from './web-client/web-sdk/web-sdk-note';
import { LyncSDKNote } from './web-client/lync-sdk/lync-sdk-note';
import { InitializeData } from './web-client/services/initialize-data';
import { OutboundCall } from './web-client/services/outbound-call';
import { OutboundCallViewComponent } from './web-client/components/outbound-call-view/outbound-call-view.component';
import { OutBoundCallStateMachine } from './web-client/components/component-base/outbound-call-state-machine';
import { IconPathsService } from './web-client/services/icon-paths-service';
import { UserInitializeData } from './web-client/services/user-initialize-data';
import { ConfigService } from './web-client/services/config-service';
import { environment } from '../environments/environment';
import { HttpClientModule } from '@angular/common/http';
import { DynamicsChannelIntegration } from './web-client/services/dynamics-channel-integration';
import { DynamicsTestComponent } from './dynamics-test/dynamics-test.component';
import { DynamicsAppComponent } from './web-client/components/dynamics/dynamics-app/dynamics-app.component';
import { DynamicsCallViewComponent } from './web-client/components/dynamics/dynamics-call-view/dynamics-call-view.component';
import { DynamicsOutboundCallViewComponent } from './web-client/components/dynamics/dynamics-outbound-call-view/dynamics-outbound-call-view.component';
import { DynamicsContactSearchComponent } from './web-client/components/dynamics/dynamics-contact-search/dynamics-contact-search.component';
import { DynamicsCc4skypeContactSearchComponent } from './web-client/components/dynamics/dynamics-cc4skype-contact-search/dynamics-cc4skype-contact-search.component';
import { CallSessionTimer } from './web-client/services/call-session-timer';
import { BootstrapTestComponent } from './web-client/components/bootstrap-test/bootstrap-test.component';
import { DynamicsLastActivityUpdateComponent } from './web-client/components/dynamics/dynamics-last-activity-update/dynamics-last-activity-update.component';

const appRoutes: Routes =
  [
    { path: 'with-user-id/:id', component: AppComponent },
    { path:'dynamics',component:DynamicsAppComponent},
    { path: '', component: AppComponent }    
  ];

@NgModule({
   declarations: [
      AppComponent,
      ServerComponent,
      ApplesComponent,
      ServersComponent,
      CockpitComponent,
      ContactsComponent,
      LoginViewComponent,
      CallViewComponent,
      LogViewComponent,
      PresenceSelectComponent,
      ContactSearchComponent,
      MeetingJoinComponent,
      DtmfMenuComponent,
      CallCenterCallViewComponent,
      AppEntryComponent,
      OperatorCallsComponent,
      WaitingMediaComponent,
      HandlingMediaComponent,
      OutboundCallViewComponent,
      DynamicsTestComponent,
      DynamicsAppComponent,
      DynamicsCallViewComponent,
      DynamicsOutboundCallViewComponent,
      DynamicsContactSearchComponent,
      DynamicsCc4skypeContactSearchComponent,
      BootstrapTestComponent,
      DynamicsLastActivityUpdateComponent,
   ],
   imports: [
      HttpClientModule,
      BrowserModule,
      FormsModule,
      RouterModule.forRoot(appRoutes)
   ],
   providers: [
      LoggingService,
      AnotherService,
      SubjectTestService,
      SocketManager,
      ServiceCall,
      IncomingRequests,
      Messaging,
      Listeners,
      WebSDKInitializer,
      WebSDKGlobals,
      WebSDKSignIn,
      WebSDKContacts,
      ContactsService,
      WebSDKAudioService,
      WebSDKPresence,
      WebSDKNote,
      Globals,
      CacheService,
      LyncApiGlobals,
      WebSDKApi,
      LyncApiContainer,
      WebSDKCache,
      LyncSDKInitializer,
      LyncSDKSignIn,
      LyncSDKContacts,
      LyncSDKAudioService,
      LyncSDKPresence,
      LyncSDKNote,
      LyncSDKApi,
      CallSessionStateChangeListener,
      ActiveCallSession,
      CallSessionRequests,
      WebClientHostAddress,
      RecordingStateChangeListener,
      CallViewStateMachine,
      OutBoundCallStateMachine,
      XHRHook,
      CookiesService,
      InitializeData,
      OutboundCall,
      IconPathsService,
      UserInitializeData,
      ConfigService,
      DynamicsChannelIntegration,
      CallSessionTimer,
      { provide: APP_INITIALIZER, useFactory: ConfigLoader, deps: [ConfigService], multi: true }
  ]
  ,
  bootstrap: [AppEntryComponent]
})
export class AppModule {

}

export function ConfigLoader(configService: ConfigService) {
  return () => configService.load(environment.configFile);
}


