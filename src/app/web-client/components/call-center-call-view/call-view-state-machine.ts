import { StateMachine, State } from "./state-machine";
import { StateName, ConferenceStatusAction } from "./enums";
import { CallCenterCallViewComponent } from "./call-center-call-view.component";
import { Subject } from "rxjs";
import { LoggingService } from "../../../logging-service";
import { Injectable } from "@angular/core";
import { CallCenterCallViewBase } from "../component-base/callcenter-callview-base";

@Injectable()
export class CallViewStateMachine {

    currentState:StateName;

    stateMachine: StateMachine<StateName, ConferenceStatusAction> = new StateMachine<StateName, ConferenceStatusAction>();

    stateChanged = new Subject<{previousState:StateName,currentState:StateName}>();

    constructor(private logger:LoggingService)
    {
        this.bindStateChanged();
    }        

    bindStateChanged(){

        this.stateMachine.stateChanged.subscribe(args=>{
            
            this.stateChanged.next({previousState:StateName[args.previousState.name],currentState:StateName[args.currentState.name]});

        });
    }

    getState(stateName: StateName): State<StateName, ConferenceStatusAction> {
        return this.stateMachine.getState(stateName);
    }

    next(action:ConferenceStatusAction){
        try
        {
            this.logger.log(`call-view-state-machine.action:${action}`);

            this.stateMachine.next(action);

            this.logger.log(`call-view-state-machine.after next`);

            this.currentState = StateName[this.stateMachine.currentState.name];
        
            this.logger.log(`call-view-state-machine.after next, current state:${this.currentState}`);

        }
        catch(err){
            this.logger.log(`call-view-state-machine.next error:${JSON.parse(err)}`);
        }
    }

    init(cw: CallCenterCallViewBase) {


        for (let sName in StateName) {

            if (Number(sName) || sName == '0') {

                let state: State<StateName, ConferenceStatusAction> = new State<StateName, ConferenceStatusAction>();
                //state.name = (<any>StateName)[sName];
                state.name = sName.toString();

                this.stateMachine.addState(state);

            }

        }

        this.currentState = StateName.OffHook;

        this.stateMachine.setState(StateName.OffHook);

        this.getState(StateName.OffHook).
            setOnEnter(() => { cw.stateEnterOfHook(); }).
            setOnExit(() => { cw.stateExitOfHook(); }).
            addTransition({ value: ConferenceStatusAction.Ringing, nextState: StateName.FirstAgentCallRinging,
                guard:()=>cw.isFirstAgent
             }).           
            addTransition({ value: ConferenceStatusAction.PickedUp, nextState: StateName.FirstOperatorAgentConnected }).

            addTransition({
                value: ConferenceStatusAction.OperatorColdTransfered, nextState: StateName.ColdTransferInviteRinging,
                guard: () => cw.isSecondAgent
            }).

            addTransition({
                value: ConferenceStatusAction.WarmInviteSent, nextState: StateName.WarmTransferInviteRinging,
                guard: () => cw.isSecondAgent
            }).

            addTransition({ value: ConferenceStatusAction.Monitoring, nextState: StateName.Monitoring, guard: () => cw.isSupervisor });
       

        this.getState(StateName.Monitoring).
            setOnEnter(() => { cw.stateEnterMonitoring(); }).
            setOnExit(() => { cw.stateExitMonitoring(); }).
            addTransitions([
                { value: ConferenceStatusAction.Terminated, nextState: StateName.OffHook },
                { value: ConferenceStatusAction.AgentClosed, nextState: StateName.OffHook },
                { value: ConferenceStatusAction.CallerClosedAfterAnswer, nextState: StateName.OffHook },
                { value: ConferenceStatusAction.SupervisorClosed, nextState: StateName.OffHook },

                {
                    value: ConferenceStatusAction.MonitoringEnded, nextState: StateName.OffHook
                }
            ]);


        this.getState(StateName.FirstAgentCallRinging).
            setOnEnter(() => { cw.stateEnterFirstAgentCallRinging(); }).
            setOnExit(() => { cw.stateExitFirstAgentCallRinging(); }).
            addTransitions([
                { value: ConferenceStatusAction.Ignored, nextState: StateName.OffHook },
                { value: ConferenceStatusAction.Fallback, nextState: StateName.OffHook },
                { value: ConferenceStatusAction.Terminated, nextState: StateName.OffHook },
                { value: ConferenceStatusAction.CallerClosedBeforeAnswer, nextState: StateName.OffHook },

                {
                    value: ConferenceStatusAction.SimultaniousIgnored, nextState: StateName.OffHook,
                    guard: () => { return cw.isFirstAgent; }
                },

                {
                    value: ConferenceStatusAction.Accepted, nextState: StateName.OffHook,
                    guard: () => { return !cw.isFirstAgent; }
                },

                {
                    value: ConferenceStatusAction.Accepted, nextState: StateName.FirstNormalAgentConnected,
                    guard: () => { return cw.isFirstAgent && !cw.mediaModel.IsOperatorCall; }
                },

                {
                    value: ConferenceStatusAction.Accepted, nextState: StateName.FirstOperatorAgentConnected,
                    guard: () => { return cw.isFirstAgent && cw.mediaModel.IsOperatorCall; }
                },

            ]);



        this.getState(StateName.WarmTransferInviteRinging).
            setOnEnter(() => { cw.stateEnterWarmTransferInviteRinging(); }).
            setOnExit(() => { cw.stateExitWarmTransferInviteRinging(); }).
            addTransitions([
                { value: ConferenceStatusAction.WarmInviteRejected, nextState: StateName.OffHook, guard: () => cw.isSecondAgent },

                {
                    value: ConferenceStatusAction.WarmInviteRejected, nextState: StateName.FirstNormalAgentConnected,
                    guard: () => cw.isFirstAgent && !cw.mediaModel.IsOperatorCall
                },

                {
                    value: ConferenceStatusAction.WarmInviteRejected, nextState: StateName.FirstOperatorAgentConnected,
                    guard: () => cw.isFirstAgent && cw.mediaModel.IsOperatorCall
                },

                {
                    value: ConferenceStatusAction.WarmCanceled, nextState: StateName.FirstNormalAgentConnected,
                    guard: () => cw.isFirstAgent && !cw.mediaModel.IsOperatorCall
                },

                {
                    value: ConferenceStatusAction.WarmCanceled, nextState: StateName.FirstOperatorAgentConnected,
                    guard: () => cw.isFirstAgent && cw.mediaModel.IsOperatorCall
                },

                {
                    value: ConferenceStatusAction.WarmCanceled, nextState: StateName.OffHook,
                    guard: () => cw.isSecondAgent
                },

                {
                    value: ConferenceStatusAction.WarmInviteAccepted, nextState: StateName.WarmInviteAcceptedSecondAgent,
                    guard: () => cw.isSecondAgent
                },

                {
                    value: ConferenceStatusAction.WarmInviteAccepted, nextState: StateName.WarmInviteAcceptedFirstAgent,
                    guard: () => cw.isFirstAgent
                },

                {
                    value: ConferenceStatusAction.WarmInviteAccepted, nextState: StateName.OffHook,
                    guard: () => !cw.isFirstAgent && !cw.isSecondAgent && cw.mediaModel.IsTransferedToExternal
                },

                { value: ConferenceStatusAction.AgentClosed, nextState: StateName.OffHook },

                { value: ConferenceStatusAction.Terminated, nextState: StateName.OffHook },

                { value: ConferenceStatusAction.CallerClosedAfterAnswer, nextState: StateName.OffHook }

            ]);



        this.getState(StateName.ColdTransferInviteRinging).
            setOnEnter(() => { cw.stateEnterColdTransferInviteRinging(); }).
            setOnExit(() => { cw.stateExitColdTransferInviteRinging(); }).
            addTransitions([
                { value: ConferenceStatusAction.Fallback, nextState: StateName.OffHook },
                { value: ConferenceStatusAction.SimultaniousIgnored, nextState: StateName.OffHook },
                { value: ConferenceStatusAction.Ignored, nextState: StateName.OffHook },
                { value: ConferenceStatusAction.OnHold, nextState: StateName.OffHook },
                { value: ConferenceStatusAction.Accepted, nextState: StateName.FirstNormalAgentConnected },
                { value: ConferenceStatusAction.Terminated, nextState: StateName.OffHook },
                { value: ConferenceStatusAction.CallerClosedBeforeAnswer, nextState: StateName.OffHook },
            ]);

        ///////


        this.getState(StateName.WarmInviteAcceptedFirstAgent).
            setOnEnter(() => { cw.stateEnterWarmAcceptedFirstAgent(); }).
            setOnExit(() => { cw.stateExitWarmAcceptedFirstAgent(); }).
            addTransitions([

                { value: ConferenceStatusAction.WarmSwitchToAgent, nextState: StateName.WarmInviteAcceptedFirstAgent, action: () => { cw.afterTransitionWarmSwitchToAgent() } },
                { value: ConferenceStatusAction.WarmSwitchToCaller, nextState: StateName.WarmInviteAcceptedFirstAgent, action: () => { cw.afterTransitionWarmSwitchToCaller() } },

                { value: ConferenceStatusAction.AgentClosed, nextState: StateName.OffHook },
                { value: ConferenceStatusAction.CallerClosedAfterAnswer, nextState: StateName.OffHook },
                { value: ConferenceStatusAction.Terminated, nextState: StateName.OffHook },
                { value: ConferenceStatusAction.WarmAccepted, nextState: StateName.OffHook },

                {
                    value: ConferenceStatusAction.WarmCanceled, nextState: StateName.FirstNormalAgentConnected,
                    guard: () => cw.isFirstAgent && !cw.mediaModel.IsOperatorCall
                },

                {
                    value: ConferenceStatusAction.WarmCanceled, nextState: StateName.FirstOperatorAgentConnected,
                    guard: () => cw.isFirstAgent && cw.mediaModel.IsOperatorCall
                },

            ]);


        this.getState(StateName.WarmInviteAcceptedSecondAgent).
            setOnEnter(() => { cw.stateEnterWarmInviteAcceptedSecondAgent(); }).
            setOnExit(() => { cw.stateExitWarmInviteAcceptedSecondAgent(); }).
            addTransitions([
                { value: ConferenceStatusAction.Terminated, nextState: StateName.OffHook },
                { value: ConferenceStatusAction.WarmAccepted, nextState: StateName.FirstNormalAgentConnected, guard: () => cw.isFirstAgent && !cw.mediaModel.IsOperatorCall },
                { value: ConferenceStatusAction.WarmAccepted, nextState: StateName.FirstOperatorAgentConnected, guard: () => cw.isFirstAgent && cw.mediaModel.IsOperatorCall },
                { value: ConferenceStatusAction.WarmCanceled, nextState: StateName.OffHook },
                { value: ConferenceStatusAction.CallerClosedAfterAnswer, nextState: StateName.OffHook },

            ]);


        this.getState(StateName.FirstNormalAgentConnected).
            setOnEnter(() => { cw.stateEnterFirstNormalAgentConnected(); }).
            setOnExit(() => { cw.stateExitFirstNormalAgentConnected(); }).
            addTransitions([

                { value: ConferenceStatusAction.OnHold, nextState: StateName.FirstNormalAgentConnected, action: () => { cw.afterTransitionOnHold(); } },
                { value: ConferenceStatusAction.Resumed, nextState: StateName.FirstNormalAgentConnected, action: () => { cw.afterTransitionResume(); } },

                { value: ConferenceStatusAction.Terminated, nextState: StateName.OffHook },
                { value: ConferenceStatusAction.AgentClosed, nextState: StateName.OffHook },
                { value: ConferenceStatusAction.CallerClosedAfterAnswer, nextState: StateName.OffHook },
                { value: ConferenceStatusAction.WarmInviteSent, nextState: StateName.WarmTransferInviteRinging },
            ]);


        this.getState(StateName.FirstOperatorAgentConnected).
            setOnEnter(() => { cw.stateEnterFirstOperatorAgentConnected(); }).
            setOnExit(() => { cw.stateExitFirstOperatorAgentConnected(); }).
            addTransitions([

                { value: ConferenceStatusAction.OnHold, nextState: StateName.FirstOperatorAgentConnected, action: () => { cw.afterTransitionOnHold(); } },
                { value: ConferenceStatusAction.Resumed, nextState: StateName.FirstOperatorAgentConnected, action: () => { cw.afterTransitionResume(); } },

                { value: ConferenceStatusAction.AgentClosed, nextState: StateName.OffHook },
                { value: ConferenceStatusAction.Terminated, nextState: StateName.OffHook },
                { value: ConferenceStatusAction.Fallback, nextState: StateName.OffHook },
                { value: ConferenceStatusAction.CallerClosedAfterAnswer, nextState: StateName.OffHook },
                { value: ConferenceStatusAction.OperatorPark, nextState: StateName.OffHook },
                { value: ConferenceStatusAction.SimultaniousIgnored, nextState: StateName.OffHook },
                { value: ConferenceStatusAction.WarmInviteSent, nextState: StateName.WarmTransferInviteRinging },
                { value: ConferenceStatusAction.OperatorColdTransfered, nextState: StateName.OffHook, guard: () => cw.isFirstAgent },
                { value: ConferenceStatusAction.PersonalParked, nextState: StateName.OffHook, guard: () => cw.isFirstAgent },

            ]);

        /* for(let s in allStates){
  
            allStates[s].transitions.forEach(t=>{
              t.valueAsString = ConferenceStatusAction[t.value];
            });
  
        } */

    }

}
