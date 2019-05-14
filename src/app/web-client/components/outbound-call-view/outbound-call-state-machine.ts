import { StateMachine, State } from "../call-center-call-view/state-machine";
import { ConferenceStatusAction } from "../call-center-call-view/enums";
import { Subject } from "rxjs";
import { OutboundCallViewComponent } from "./outbound-call-view.component";
import { Injectable } from "@angular/core";

@Injectable()
export class OutBoundCallStateMachine{

    stateChanged = new Subject<{previousState:OutBoundCallStateName,currentState:OutBoundCallStateName}>();
    
    stateMachine: StateMachine<OutBoundCallStateName, ConferenceStatusAction> = new StateMachine<OutBoundCallStateName, ConferenceStatusAction>();

    currentState:OutBoundCallStateName;
    
    constructor()
    {
        this.bindStateChanged();
    }

    next(action:ConferenceStatusAction){
        
        this.stateMachine.next(action);

        this.currentState = OutBoundCallStateName[this.stateMachine.currentState.name];

    }

    private bindStateChanged(){

        this.stateMachine.stateChanged.subscribe(args=>{
            
            this.stateChanged.next({previousState:OutBoundCallStateName[args.previousState.name],currentState:OutBoundCallStateName[args.currentState.name]});

        });
    }

    init(cw:OutboundCallViewComponent){

        for (let sName in OutBoundCallStateName) {

            if (Number(sName) || sName == '0') {

                let state: State<OutBoundCallStateName, ConferenceStatusAction> = new State<OutBoundCallStateName, ConferenceStatusAction>();
                //state.name = (<any>StateName)[sName];
                state.name = sName.toString();

                this.stateMachine.addState(state);

            }

        }

        this.currentState = OutBoundCallStateName.OffHook;

        this.stateMachine.setState(OutBoundCallStateName.OffHook);

        this.stateMachine.getState(OutBoundCallStateName.OffHook).
        setOnExit(() => { cw.stateEnterOfHook(); }).
        addTransitions([
            {value:ConferenceStatusAction.Ringing, nextState : OutBoundCallStateName.Ringing},
            { value:ConferenceStatusAction.WarmInviteSent, nextState : OutBoundCallStateName.WarmInviteRingingSecondAgent,guard: () => cw.isSecondAgent},
            { value:ConferenceStatusAction.OperatorColdTransferInviteSent, nextState : OutBoundCallStateName.ColdTransferSecondAgentInviteSent}             
        ]);

        this.stateMachine.getState(OutBoundCallStateName.Ringing).addTransitions([
            {value:ConferenceStatusAction.AgentClosed, nextState : OutBoundCallStateName.OffHook}
            ,
            {value:ConferenceStatusAction.Accepted,nextState:OutBoundCallStateName.Accepted}
        ]);

        this.stateMachine.getState(OutBoundCallStateName.Accepted).addTransitions([
            { value:ConferenceStatusAction.AgentClosed, nextState : OutBoundCallStateName.OffHook} ,
            { value:ConferenceStatusAction.Terminated, nextState : OutBoundCallStateName.OffHook} ,
            { value:ConferenceStatusAction.CallerClosedAfterAnswer, nextState : OutBoundCallStateName.OffHook} ,
            
            { value: ConferenceStatusAction.OnHold, nextState: OutBoundCallStateName.Accepted, action: () => { cw.afterTransitionOnHold(); } },
            { value: ConferenceStatusAction.Resumed, nextState: OutBoundCallStateName.Accepted, action: () => { cw.afterTransitionResume(); } },           
            { value:ConferenceStatusAction.WarmInviteSent, nextState : OutBoundCallStateName.WarmInviteRingingFirstAgent,guard: () => cw.isFirstAgent},
            { value:ConferenceStatusAction.OperatorColdTransferInviteSent, nextState : OutBoundCallStateName.ColdTransferFirstAgentInviteSent} 
        ]);

        this.stateMachine.getState(OutBoundCallStateName.WarmInviteRingingFirstAgent).addTransitions([
            
            { value:ConferenceStatusAction.AgentClosed, nextState : OutBoundCallStateName.OffHook} ,
            { value:ConferenceStatusAction.Terminated, nextState : OutBoundCallStateName.OffHook} ,
            { value:ConferenceStatusAction.CallerClosedAfterAnswer, nextState : OutBoundCallStateName.OffHook} ,

            {value:ConferenceStatusAction.WarmInviteAccepted,nextState:OutBoundCallStateName.WarmInviteAcceptedFirstAgent},
            {value:ConferenceStatusAction.WarmInviteRejected,nextState:OutBoundCallStateName.Accepted},
            {value:ConferenceStatusAction.WarmCanceled,nextState:OutBoundCallStateName.Accepted}
        ]);

        this.stateMachine.getState(OutBoundCallStateName.WarmInviteRingingSecondAgent).addTransitions([
            
            { value:ConferenceStatusAction.AgentClosed, nextState : OutBoundCallStateName.OffHook} ,
            { value:ConferenceStatusAction.Terminated, nextState : OutBoundCallStateName.OffHook} ,
            { value:ConferenceStatusAction.CallerClosedAfterAnswer, nextState : OutBoundCallStateName.OffHook} ,
            
            {value:ConferenceStatusAction.WarmInviteAccepted,nextState:OutBoundCallStateName.WarmInviteAcceptedSecondAgent},
            {value:ConferenceStatusAction.WarmInviteRejected,nextState:OutBoundCallStateName.OffHook},
            {value:ConferenceStatusAction.WarmCanceled,nextState:OutBoundCallStateName.OffHook}
        ]);

        this.stateMachine.getState(OutBoundCallStateName.WarmInviteAcceptedSecondAgent).addTransitions([
            
            { value:ConferenceStatusAction.AgentClosed, nextState : OutBoundCallStateName.OffHook} ,
            { value:ConferenceStatusAction.Terminated, nextState : OutBoundCallStateName.OffHook} ,
            { value:ConferenceStatusAction.CallerClosedAfterAnswer, nextState : OutBoundCallStateName.OffHook} ,
            
            {value:ConferenceStatusAction.WarmAccepted,nextState:OutBoundCallStateName.Accepted},
            {value:ConferenceStatusAction.WarmCanceled,nextState:OutBoundCallStateName.OffHook}
        ]);

        this.stateMachine.getState(OutBoundCallStateName.WarmInviteAcceptedFirstAgent).
        setOnExit(() => { cw.stateExitWarmInviteAcceptedFirstAgent(); }).
        addTransitions([
            
            { value:ConferenceStatusAction.AgentClosed, nextState : OutBoundCallStateName.OffHook} ,
            { value:ConferenceStatusAction.Terminated, nextState : OutBoundCallStateName.OffHook} ,
            { value:ConferenceStatusAction.CallerClosedAfterAnswer, nextState : OutBoundCallStateName.OffHook} ,
            
            {value:ConferenceStatusAction.WarmAccepted,nextState:OutBoundCallStateName.OffHook},
            {value:ConferenceStatusAction.WarmCanceled,nextState:OutBoundCallStateName.Accepted}
        ]);

        this.stateMachine.getState(OutBoundCallStateName.ColdTransferFirstAgentInviteSent).addTransitions([
            
            { value:ConferenceStatusAction.AgentClosed, nextState : OutBoundCallStateName.OffHook} ,
            { value:ConferenceStatusAction.Terminated, nextState : OutBoundCallStateName.OffHook} ,
            { value:ConferenceStatusAction.CallerClosedAfterAnswer, nextState : OutBoundCallStateName.OffHook} ,
            
            {value:ConferenceStatusAction.OperatorColdTransferInviteAccepted,nextState:OutBoundCallStateName.OffHook},
            {value:ConferenceStatusAction.OperatorColdTransferInviteRejected,nextState:OutBoundCallStateName.Accepted},
            {value:ConferenceStatusAction.OperatorColdTransferInviteCancelled,nextState:OutBoundCallStateName.Accepted}
        ]);

        this.stateMachine.getState(OutBoundCallStateName.ColdTransferSecondAgentInviteSent).addTransitions([
            
            { value:ConferenceStatusAction.AgentClosed, nextState : OutBoundCallStateName.OffHook} ,
            { value:ConferenceStatusAction.Terminated, nextState : OutBoundCallStateName.OffHook} ,
            { value:ConferenceStatusAction.CallerClosedAfterAnswer, nextState : OutBoundCallStateName.OffHook} ,
            
            {value:ConferenceStatusAction.OperatorColdTransferInviteAccepted,nextState:OutBoundCallStateName.Accepted},
            {value:ConferenceStatusAction.OperatorColdTransferInviteRejected,nextState:OutBoundCallStateName.OffHook},
            {value:ConferenceStatusAction.OperatorColdTransferInviteCancelled,nextState:OutBoundCallStateName.OffHook}
        ]);

        
    }

}

export enum OutBoundCallStateName
{
    OffHook,
    Ringing,
    Accepted,
    WarmInviteRingingFirstAgent,
    WarmInviteRingingSecondAgent,
    WarmInviteAcceptedFirstAgent,
    WarmInviteAcceptedSecondAgent,
    ColdTransferFirstAgentInviteSent,
    ColdTransferSecondAgentInviteSent,    
}