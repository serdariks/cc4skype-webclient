import { Component, OnInit } from '@angular/core';
import { Listeners } from '../../services/listeners';
import { Listener } from 'src/app/web-client/services/listener';
import { LoggingService } from '../../../logging-service';
import { OutBoundCallStateMachine, OutBoundCallStateName } from './outbound-call-state-machine';
import { IconPathsService, IconPaths } from '../../services/icon-paths-service';
import { LyncApiContainer } from '../../lync-api/lync-api-container';
import { LyncApiAudioService } from '../../lync-api/lync-api-audio-service';
import { ActiveCallSession } from '../../services/active-call-session';
import { CallSessionRequests } from '../../services/call-session-requests';
import { RecordingStateChangeListener } from '../../services/recording-state-change-listener';
import { LyncApiGlobals } from '../../lync-api/lync-api-globals';
import { ConferenceStatusAction } from '../call-center-call-view/enums';

export class OutboundCallViewBase implements OnInit {

  private lyncApiAudioService:LyncApiAudioService;

  constructor(private listeners:Listeners,private logger:LoggingService,private stateMachine:OutBoundCallStateMachine,
    private iconPathsService:IconPathsService,private apiContainer:LyncApiContainer,private activeCallSession:ActiveCallSession,
    private callSessionRequests:CallSessionRequests,private recordingStateChangedListener:RecordingStateChangeListener,private lyncApiGlobals:LyncApiGlobals) {

      this.lyncApiAudioService = apiContainer.currentApi.audioService;
      
      this.outboundCallMessagesListener = this.listeners.createListener<any>('PublishOutBoundCallMessage');

      stateMachine.init(this);

      this.currentState = stateMachine.currentState;

  }

  currentState:OutBoundCallStateName;

  outboundCallMessagesListener:Listener<any>;

  lastModel:any;
  lastModelJson:string;  

  iconPaths:IconPaths = this.iconPathsService.iconPaths;

  hasActiveCall:boolean = false;
  isRecording:boolean = false;
  onHoldButtonVisible:boolean = true;
  resumeButtonVisible:boolean = false;

  private bindOutBoundCallMessagesListener(){   

    this.outboundCallMessagesListener.received.subscribe(model=>{

      this.lastModel = model;
      this.lastModelJson = JSON.stringify(model);
      this.logger.log(`outbound-call-view-component. message received:${this.lastModelJson}`);       

      //this.hasActiveCall = model.ConferenceActionAsString!='Terminated';

      this.setActiveCallSession(model);

      this.stateMachine.next(model.ConferenceAction);

      this.currentState = this.stateMachine.currentState;

      this.hasActiveCall = !this.isActiveView(OutBoundCallStateName.OffHook);

      this.logger.log(`outbound-call-view-component. conference action:${model.ConferenceActionAsString} current state:${this.currentState}`);

      this.setActiveView();

      this.setSwitchToCaller();
    

    });

  }

  setSwitchToCaller(){

    if(!this.warmSwitchedToCaller && this.lastModel.ConferenceActionAsString == ConferenceStatusAction[ConferenceStatusAction.WarmSwitchToCaller]){
      this.logger.log('outbound-call-view-component. switched to caller');
      this.warmSwitchedToCaller = true;
    }else if(this.warmSwitchedToCaller && this.lastModel.ConferenceActionAsString == ConferenceStatusAction[ConferenceStatusAction.WarmSwitchToAgent]){
      this.warmSwitchedToCaller = false;
      this.logger.log('outbound-call-view-component. switched to agent');
    }

  }
  
  stateExitWarmInviteAcceptedFirstAgent(){
    this.warmSwitchedToCaller = false;
  }

  bindRecordingStateChanged(){

    this.recordingStateChangedListener.stateChanged.subscribe(c=>{

      this.isRecording = c.isRecording;

    });

  }

  private setActiveCallSession(model:any){

    if(this.hasActiveCall)
    {
      this.logger.log(`bindCallSessionStateChanged has active call`);

      this.activeCallSession.setActiveCallSession(model.OwnerKey,model.ConversationKey,model.SessionId);
    }
    else
    {
      this.logger.log(`bindCallSessionStateChanged no active call`);

      this.activeCallSession.removeActiveCallSession();

      this.resetView();
    }


  }

  ngOnInit() {

    this.bindOutBoundCallMessagesListener();
    this.bindRecordingStateChanged();
  }

  isRinging:boolean;
  isAccepted:boolean;
  isWarmInviteRingingFirstAgent:boolean;
  isWarmInviteRingingSecondAgent:boolean;
  isWarmTransferSecondAgentAnswered:boolean;
  isWarmInviteAcceptedFirstAgent:boolean;
  isColdTransferFirstAgentInvite:boolean;
  isColdTransferSecondAgentInvite:boolean;


  setActiveView()
  {
      this.isRinging = this.isActiveView(OutBoundCallStateName.Ringing);
      this.isAccepted = this.isActiveView(OutBoundCallStateName.Accepted);
      this.isWarmInviteRingingFirstAgent = this.isActiveView(OutBoundCallStateName.WarmInviteRingingFirstAgent);
      this.isWarmInviteRingingSecondAgent = this.isActiveView(OutBoundCallStateName.WarmInviteRingingSecondAgent);
      this.isWarmTransferSecondAgentAnswered = this.isActiveView(OutBoundCallStateName.WarmInviteAcceptedSecondAgent);
      this.isWarmInviteAcceptedFirstAgent = this.isActiveView(OutBoundCallStateName.WarmInviteAcceptedFirstAgent);
      this.isColdTransferFirstAgentInvite = this.isActiveView(OutBoundCallStateName.ColdTransferFirstAgentInviteSent);
      this.isColdTransferSecondAgentInvite = this.isActiveView(OutBoundCallStateName.ColdTransferSecondAgentInviteSent);

      this.setOtherAgent();
  }

  private isActiveView(state:OutBoundCallStateName):boolean{
    return OutBoundCallStateName[state]== this.currentState.toString();
  }

  onCancelOutBoundCall(){

    this.lyncApiAudioService.hangUp();

  }

  onToggleRecording(){
    
    if(this.isRecording)
    {
      this.callSessionRequests.outBoundManualRecordStop();
    }
    else
    {
      this.callSessionRequests.outBoundManualRecordStart();
    }
    
  }

  onAgentPutOnHold()
  {
      this.callSessionRequests.outBoundPutOnHold();
  }

  resetView()
  {
    this.afterTransitionResume();
  }
  afterTransitionOnHold()
  {
    this.onHoldButtonVisible = false;
    this.resumeButtonVisible = true;
  }

  onAgentResumed()
  {
      this.callSessionRequests.outBoundResume();
  }

  afterTransitionResume(){

      this.onHoldButtonVisible = true;
      this.resumeButtonVisible = false;
  }

  onHangupCall()
  {
    this.lyncApiAudioService.hangUp();
  }

  get isFirstAgent():boolean
  {
    return this.lastModel.CallerAgentSIP == this.lyncApiGlobals.personSignedIn.id;    
  }

  get isSecondAgent():boolean
  {
    return this.lastModel.TransferingAgentSip == this.lyncApiGlobals.personSignedIn.id;    
  }

  onCancelWarmTransferRinging(){

    this.callSessionRequests.outBoundWarmTransferCancel(this.lastModel.TransferingAgentSip);
  }
  onRejectCall()
  {
    this.lyncApiAudioService.hangUp();
  }
  onRejectWarmTransfer()
  {
    this.lyncApiAudioService.hangUp();
  }

  onAcceptCall(){

    this.lyncApiAudioService.acceptCall().then(r=>{
      this.logger.log('after accept');
    });

  }

  onWarmTransferCommit()
  {
    this.lyncApiAudioService.hangUp();
  }
  onCancelWarmTransferSession()
  {
    this.callSessionRequests.outBoundWarmTransferCancel(this.lastModel.TransferingAgentSip);
  }
  onCancelColdTransfer(){
    ///???
  }

  warmSwitchedToCaller = false;

  onSwitchToCaller(){

    this.callSessionRequests.switchToCallerDuringWarmTransfer();

  }
  onSwitchToAgent(){
    this.callSessionRequests.switchToAgentDuringWarmTransfer();
  }

  stateEnterOfHook(){
    this.isRecording = false;
    this.warmSwitchedToCaller = false;
    this.onHoldButtonVisible = true;
    this.resumeButtonVisible = false;
  }

  otherAgent:string;
  otherAgentFormattedString:string;
  hasOtherAgent:boolean;

  setOtherAgent(){

    let stateName:string = this.currentState.toString();

    if(stateName == OutBoundCallStateName[OutBoundCallStateName.WarmInviteAcceptedFirstAgent]){
      this.otherAgent = this.lastModel.TransferingAgentSip;
      this.otherAgentFormattedString = `In a call with transfer target:${this.otherAgent}`;
    }else if(stateName == OutBoundCallStateName[OutBoundCallStateName.WarmInviteAcceptedSecondAgent]){
      this.otherAgent = this.lastModel.CallerAgentSIP;
      this.otherAgentFormattedString = `Transfer coming from:${this.otherAgent}`;
    }else if(stateName == OutBoundCallStateName[OutBoundCallStateName.WarmInviteRingingFirstAgent]){      
      this.otherAgent = this.lastModel.TransferingAgentSip;
      this.otherAgentFormattedString = `calling transfer target:${this.otherAgent}`;
    }else if(stateName == OutBoundCallStateName[OutBoundCallStateName.WarmInviteRingingSecondAgent])
    {
      this.otherAgent = this.lastModel.CallerAgentSIP;
      this.otherAgentFormattedString = `${this.otherAgent} is calling for tranfer`;
    }    
    else{
      this.otherAgent = null;
      this.otherAgentFormattedString = null;
    }

    this.hasOtherAgent = this.otherAgent!=null;    

  }

  

}
