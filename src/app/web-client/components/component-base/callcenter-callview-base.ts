import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CallSessionStateChangeListener } from '../../services/call-session-state-change-listener';
import { LoggingService } from '../../../logging-service';
import { LyncApiGlobals } from '../../lync-api/lync-api-globals';
import { CallViewStateMachine } from '../call-center-call-view/call-view-state-machine';
import { StateName } from '../call-center-call-view/enums';
import { ActiveCallSession } from '../../services/active-call-session';
import { CallSessionRequests, MonitoringType } from '../../services/call-session-requests';
import { LyncApiContainer } from '../../lync-api/lync-api-container';
import { LyncApiAudioService } from '../../lync-api/lync-api-audio-service';
import { RecordingStateChangeListener } from '../../services/recording-state-change-listener';
import { Listeners } from '../../services/listeners';
import { IconPathsService, IconPaths } from '../../services/icon-paths-service';
import { DynamicsChannelIntegration, CallDirection } from '../../services/dynamics-channel-integration';
import { Subscription } from 'rxjs';


export class CallCenterCallViewBase implements OnInit,OnDestroy {

  private lyncApiAudioService:LyncApiAudioService;
  
  constructor(private callSessionStateChangeListener:CallSessionStateChangeListener,
    private logger:LoggingService,private lyncApiGlobals:LyncApiGlobals,
    private cdRef: ChangeDetectorRef,private callSessionRequests:CallSessionRequests,
    private activeCallSession:ActiveCallSession,private apiContainer:LyncApiContainer,
    private recordingStateChangedListener:RecordingStateChangeListener,private callViewStateMachine:CallViewStateMachine,
    private listeners:Listeners,private iconPathsService:IconPathsService) {

      this.lyncApiAudioService = apiContainer.currentApi.audioService;  

      this.bindHangUpListener();

  }  

  hasActiveCall:boolean;

  //callViewStateMachine:CallViewStateMachine = new CallViewStateMachine();

  summaryCallViewStates:string;

  currentState:StateName;

  onHoldButtonVisible:boolean;
  resumeButtonVisible:boolean;
  otherAgent:string;
  otherAgentFormattedString:string;

  private hangUpListener = this.listeners.createListener<{conferencingUri:string}>('Hangup');

  ngOnInit() 
  {
    this.initIconPats();
    
    this.bindCallSessionStateChanged();
    this.bindRecordingStateChanged();
    this.bindCallViewStateChanged();

    this.callViewStateMachine.init(this);
    this.currentState = this.callViewStateMachine.currentState;
    
    this.onHoldButtonVisible = true;
    this.resumeButtonVisible = false;
    this.isRecording = false;
    //this.summaryCallViewStates = JSON.stringify(this.callViewStates.allStates);

    //this.summaryCallViewStates = JSON.stringify(this.callViewStates.allStates[StateName.OfHook].transitions);         

    
  }
  ngOnDestroy()
  {
    this.callSessionStateChangedSubscription.unsubscribe();
    this.callViewStateChangedSubscription.unsubscribe();
    this.hangUpSubscription.unsubscribe();
    this.recordingStateChangedSubscription.unsubscribe();
  }

  private hangUpSubscription:Subscription;
  private bindHangUpListener(){

    this.hangUpSubscription = this.hangUpListener.received.subscribe(({conferencingUri:string})=>{
      this.lyncApiAudioService.hangUp().then(()=>{
        this.logger.log('call-center-call-view-component: Hangup success');
      }).catch((error)=>{
        this.logger.log(`call-center-call-view-component: ${error}`);
      });
    });
    
  }

  mediaModel:any;

  private callSessionStateChangedSubscription:Subscription;

  bindCallSessionStateChanged(){

    this.callSessionStateChangedSubscription = this.callSessionStateChangeListener.stateChanged.subscribe(s=>{            
      
      this.logger.log(JSON.stringify(s));

      this.mediaModel = s;


      this.logger.log(`bindCallSessionStateChanged model received:${this.mediaModel.ConferenceActionAsString}`);

      this.hasActiveCall = s.ConferenceActionAsString != "Terminated"; 

      if(this.hasActiveCall)
      {
        this.logger.log(`bindCallSessionStateChanged has active call`);

        this.activeCallSession.setActiveCallSession(this.mediaModel.OwnerKey,this.mediaModel.ConversationKey,this.mediaModel.SessionId);
      }
      else
      {
        this.logger.log(`bindCallSessionStateChanged no active call`);

        this.activeCallSession.removeActiveCallSession();
      }
      
      this.logger.log(`bindCallSessionStateChanged before state machine execute ${this.mediaModel.ConferenceActionAsString}`);

      this.callViewStateMachine.next(this.mediaModel.ConferenceAction);

      this.logger.log(`bindCallSessionStateChanged current state:${this.callViewStateMachine.currentState.toString()}`);

      this.currentState = this.callViewStateMachine.currentState;

      this.hasActiveCall = this.currentState.toString() !=StateName[StateName.OffHook];

     /*  this.cdRef.detectChanges(); */

     this.setActiveView();
    
     this.setCurrentMonitoringType(this.mediaModel);         

     this.afterCallSessionStateChangedHandled();

    });

  }


  afterCallSessionStateChangedHandled(){

  }

  private callViewStateChangedSubscription:Subscription;

  private bindCallViewStateChanged(){

    this.callViewStateChangedSubscription = this.callViewStateMachine.stateChanged.subscribe(args=>{           
      
       let isHandled:boolean = 
        (
          args.previousState.toString() == StateName[StateName.FirstNormalAgentConnected] 
          || 
          args.previousState.toString() == StateName[StateName.WarmInviteAcceptedFirstAgent]
        )&&
        args.currentState.toString() == StateName[StateName.OffHook];      

       if(isHandled){
         this.afterHandle();
         return;
       }

       let isAnswered:boolean = 
       args.previousState.toString() == StateName[StateName.FirstNormalAgentConnected]
       args.currentState.toString() == StateName[StateName.FirstNormalAgentConnected];      

       if(isAnswered){
         this.afterAnswer();
       }

       let isIncomingCall:boolean = args.currentState.toString() == StateName[StateName.FirstAgentCallRinging];      

       if(isIncomingCall){
         this.afterIncomingCall();
       }
       

    });

  }

  afterIncomingCall(){

  }

  afterHandle(){
    
  }
  afterAnswer(){

  }

  setOtherAgent(){

    let stateName:string = this.currentState.toString();

    if(stateName == StateName[StateName.WarmInviteAcceptedFirstAgent]){
      this.otherAgent = this.mediaModel.SecondaryAgentName;
      this.otherAgentFormattedString = `In a call with transfer target:${this.otherAgent}`;
    }else if(stateName == StateName[StateName.WarmInviteAcceptedSecondAgent]){
      this.otherAgent = this.mediaModel.PrimaryAgentName;
      this.otherAgentFormattedString = `Transfer coming from:${this.otherAgent}`;
    }else if(stateName == StateName[StateName.WarmTransferInviteRinging] && this.isFirstAgent){      
      this.otherAgent = this.mediaModel.SecondaryAgentName;
      this.otherAgentFormattedString = `calling transfer target:${this.otherAgent}`;
    }else if(stateName == StateName[StateName.WarmTransferInviteRinging] && this.isSecondAgent)
    {
      this.otherAgent = this.mediaModel.PrimaryAgentName;
      this.otherAgentFormattedString = `${this.otherAgent} is calling for tranfer`;
    }
    else if(stateName == StateName[StateName.Monitoring])
    {
      this.otherAgent = this.mediaModel.PrimaryAgentName;
      this.otherAgentFormattedString = `${this.otherAgent} is handling the call`;
    }
    else{
      this.otherAgent = null;
      this.otherAgentFormattedString = null;
    }

    this.hasOtherAgent = this.otherAgent!=null;    

  }

  hasOtherAgent:boolean;


  isRecording:boolean;

  private recordingStateChangedSubscription:Subscription;

  bindRecordingStateChanged(){

    this.recordingStateChangedSubscription = this.recordingStateChangedListener.stateChanged.subscribe(c=>{

      this.isRecording = c.isRecording;

    });

  }

  onAgentPutOnHold(){
    this.callSessionRequests.agentPutOnHold();
  }
  onAgentResumed(){
    this.callSessionRequests.agentResumed();
  }

  onAcceptCall(){

    this.lyncApiAudioService.acceptCall().then(r=>{
      this.logger.log('after accept');
    });

  }

  onRejectCall(){
    this.lyncApiAudioService.rejectCall().then(r=>{
      this.logger.log('after reject');
    });
  }

  onHangupCall(){

    this.lyncApiAudioService.hangUp().then(r=>{
      this.logger.log('after hangup');
    });
  }

  onCancelWarmTransferRinging(){

    this.callSessionRequests.warmTransferCancel(this.mediaModel.SecondaryAgentSIP);
  }

  onCancelWarmTransferSession(){

    this.callSessionRequests.warmTransferCancel(this.mediaModel.SecondaryAgentSIP);
  }

  onToggleRecording()
  {
    this.callSessionRequests.toggleRecording(); 
  
  }

  onWarmTransferCommit()
  {
    this.lyncApiAudioService.hangUp();
  }

  onRejectWarmTransferInvite(){
    this.lyncApiAudioService.hangUp();
  }

  onAcceptColdTransferInvite(){
    this.lyncApiAudioService.acceptCall();
  }
  onRejectColdTransferInvite(){
    this.lyncApiAudioService.hangUp();
  }

  onRejectWarmTransfer(){
    this.lyncApiAudioService.hangUp();
  }

  onWarmTransferStart(){
    //normally it should open the contacts grid but it's currently already open.
  }

  onSwitchToCaller(){
    this.callSessionRequests.switchToCallerDuringWarmTransfer();
  }
  onSwitchToAgent(){
    this.callSessionRequests.switchToAgentDuringWarmTransfer();
  }

  onParkCall()
  {
    this.callSessionRequests.parkCall();
  }
  onToggleMonitor(nextMonitoringState:string){    

    this.callSessionRequests.toggleMonitoringState(
      { 
        currentMonitoringState:this.currentMonitoringType,
        ConversationKey: this.mediaModel.ConversationKey,
        SessionId:this.mediaModel.SessionId
      },
      nextMonitoringState);
  }  

  getLastCallSessionStateJson():string{

    if(!this.mediaModel) return null;

    return JSON.stringify(this.mediaModel);
  }

  showView(expectedState:string):boolean{

    return this.mediaModel.ConferenceActionAsString == expectedState;

  }

  get isFirstAgent():boolean
  {
    return this.mediaModel.PrimaryAgentSIP == this.lyncApiGlobals.personSignedIn.id;    
  }

  get isSecondAgent():boolean
  {
    return this.mediaModel.SecondaryAgentSIP == this.lyncApiGlobals.personSignedIn.id;    
  }

  get isSupervisor():boolean
  {
    this.logger.log(`call-center-call-view-component.before isSupervisor`);

    let result = (<string[]>this.mediaModel.SupervisorSIPList).findIndex(s=> s == this.lyncApiGlobals.personSignedIn.id) > -1;

    this.logger.log(`call-center-call-view-component.isSupervisor result:${result}`);

    return result;
  }

  //////////

  

  /////////////

  warmSwitchedToCaller:boolean;

  afterTransitionWarmSwitchToAgent()
  {
    this.warmSwitchedToCaller = false;
  }
  afterTransitionWarmSwitchToCaller(){
    this.warmSwitchedToCaller = true;
  }

  afterTransitionOnHold(){
    this.onHoldButtonVisible = false;
    this.resumeButtonVisible = true;
  }
  afterTransitionResume(){
    this.onHoldButtonVisible = true;
    this.resumeButtonVisible = false;
  }

  stateEnterFirstOperatorAgentConnected(){
    this.logger.log('callView:onOperatorConnectedEnter');
  }
  stateExitFirstOperatorAgentConnected(){
    this.logger.log('callView:onOperatorConnectedExit');
  }

  stateEnterFirstNormalAgentConnected(){

  }

  stateExitFirstNormalAgentConnected(){

  }

  stateEnterWarmInviteAcceptedSecondAgent(){

  }

  stateExitWarmInviteAcceptedSecondAgent(){

  }

  stateEnterWarmAcceptedFirstAgent(){

  }
  stateExitWarmAcceptedFirstAgent(){
      this.warmSwitchedToCaller = false;
  }

  stateEnterColdTransferInviteRinging(){

  }
  stateExitColdTransferInviteRinging(){

  }

  stateEnterWarmTransferInviteRinging(){

  }

  stateExitWarmTransferInviteRinging(){

  }

  stateEnterFirstAgentCallRinging(){
    this.logger.log('callView:onEntryRinging');
  }

  stateExitFirstAgentCallRinging(){
    this.logger.log('callView:onExitRinging');
  }

  stateEnterMonitoring(){

  }
  stateExitMonitoring(){

  }

  stateEnterOfHook(){
    this.logger.log('callView:resetCallView');
  }
  stateExitOfHook(){
    this.logger.log('callView:showCallView');
  }

  isFirstAgentCallRinging:boolean;
  isFirstNormalAgentConnected:boolean;
  isFirstOperatorAgentConnected:boolean;
  isWarmTransferInviteRinging:boolean;
  isWarmInviteAcceptedFirstAgent:boolean;
  isWarmTransfer2ndAgentAnswered:boolean;
  isColdTransferInviteRinging:boolean;
  isMonitoring:boolean;

  private setActiveView(){

    this.isFirstAgentCallRinging = this.isActiveView(StateName.FirstAgentCallRinging);
    this.isFirstOperatorAgentConnected = this.isActiveView(StateName.FirstOperatorAgentConnected);
    this.isWarmTransferInviteRinging = this.isActiveView(StateName.WarmTransferInviteRinging);
    this.isWarmInviteAcceptedFirstAgent = this.isActiveView(StateName.WarmInviteAcceptedFirstAgent);    
    this.isWarmTransfer2ndAgentAnswered = this.isActiveView(StateName.WarmInviteAcceptedSecondAgent);
    this.isFirstNormalAgentConnected = this.isActiveView(StateName.FirstNormalAgentConnected);
    this.isColdTransferInviteRinging = this.isActiveView(StateName.ColdTransferInviteRinging);
    this.isMonitoring = this.isActiveView(StateName.Monitoring);
    

    this.logger.log(`call-center-call-view-component. setActiveView, isMonitoring:${this.isMonitoring}`);

    this.setOtherAgent();

  } 
  
  currentMonitoringType:string;
 
  getMonitoringClass(monitoringButtonType:string){

    return this.currentMonitoringType == monitoringButtonType ? 'active-monitoring' : '';
  }

  setCurrentMonitoringType(model:any)
  {
    this.currentMonitoringType = model.MonitorTypeAsString;

    this.logger.log(`call-center-call-view-component. setCurrentMonitoringType:${this.currentMonitoringType}`);

  }

  private isActiveView(state:StateName):boolean{
    return StateName[state]== this.currentState.toString();
  }

  iconPaths:IconPaths = { };

  private initIconPats(){

    this.iconPaths = this.iconPathsService.iconPaths;

    /* let paths = [
      {key:'answerImg',path:'assets/img/cc4s/Answer_call.png'},
      {key:'ignoreImg',path:'assets/img/cc4s/Ignore_call.png'},
      {key:'startRecordImg',path:'assets/img/cc4s/Mute1.png'},
      {key:'stopRecordImg',path:'assets/img/cc4s/Recording.gif'},
      {key:'holdImg',path:'assets/img/cc4s/Hold1.png'},
      {key:'resumeImg',path:'assets/img/cc4s/Hold2.png'},
      {key:'parkImg',path:'assets/img/cc4s/Park.png'},
      {key:'disconnectImg',path:'assets/img/cc4s/Disconnect.png'},
      {key:'switchToCallerImg',path:'assets/img/cc4s/SwitchSides1.png'},
      {key:'switchToAgentImg',path:'assets/img/cc4s/SwitchSides2.png'},
      {key:'warmTransferCommitImg',path:'assets/img/cc4s/Warm_transfer.png'},
      {key:'warmTransferStartImg',path:'assets/img/cc4s/Warm_transfer.png'},
      {key:'silentMonitorImg',path:'assets/img/cc4s/Monitor.png'},
      {key:'whisperImg',path:'assets/img/cc4s/Whisper.png'},
      {key:'bargeInImg',path:'assets/img/cc4s/BargeIn.png'},

    ];   

    this.addIconPaths(paths); */

  }
  
 /*  private addIconPaths(iconPaths:{key:string,path:string}[])
  {
      iconPaths.forEach(p=>{this.addIconPath(p.key,p.path)});
  }
  private addIconPath(key:string,path:string){

      this.iconPaths[key] = path;
  } */

  
}

/* class IconPaths
{
  [key:string]:string   
}
 */







