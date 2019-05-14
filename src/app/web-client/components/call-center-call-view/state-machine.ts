import { Subject } from "rxjs";

export class StateMachine<TState, TTransition>{

    currentState: State<TState, TTransition>;

    stateChanged:Subject<StateChangedArguments<TState, TTransition>> = new Subject<StateChangedArguments<TState, TTransition>>();

    //private allStates: { [stateName: string]: State<TState, TTransition> } = {};

    private allStates:State<TState, TTransition>[]=[];

    addState(state: State<TState, TTransition>) {
        //this.allStates[state.name.toString()] = state;
        let existingState = this.allStates.find(s=>s.name == state.name);
        if(!existingState){
            this.allStates.push(state);
        }
    }
    
    getState(stateName: TState): State<TState, TTransition> {
        //return this.allStates[stateName.toString()];
        return this.allStates.find(s=>s.name == stateName.toString());
    }

    setState(stateName: TState){
        this.currentState = this.getState(stateName);
    }

    next(transitionValue: TTransition): State<TState, TTransition> {

        let transitionMatch = this.currentState.transitions.find(t => 
            t.value == transitionValue && (t.guard ? t.guard() : true));

        if (!transitionMatch) {
            return this.currentState;
        }
        else {
            this.currentState.onExit(); 
            
            let previousState = this.currentState;            

            this.currentState = this.getState(transitionMatch.nextState);

            //this.currentState = this.allStates[transitionMatch.nextState.toString()];

            this.currentState.onEnter();

            if(transitionMatch.action) transitionMatch.action();

            this.stateChanged.next({previousState:previousState,currentState:this.currentState});
        }

    }
}

export class StateChangedArguments<TState, TTransition>{
    previousState:State<TState, TTransition>;
    currentState:State<TState, TTransition>;
}

export class State<TState, TTransition>{
    name: string;


    transitions: Transition<TState, TTransition>[] = [];

    addTransition(transition: Transition<TState, TTransition>): State<TState, TTransition> {

        this.transitions.push(transition);
        return this;
    }

    addTransitions(transitions: Transition<TState, TTransition>[]): State<TState, TTransition> {

        transitions.forEach(t => this.addTransition(t));

        return this;
    }

    private onEnterCallBack: () => void;

    setOnEnter(onEnterCallBack: () => void): State<TState, TTransition> {
        this.onEnterCallBack = onEnterCallBack;
        return this;
    }

    private onExitCallBack: () => void;

    setOnExit(onExitCallBack: () => void): State<TState, TTransition> {
        this.onExitCallBack = onExitCallBack;

        return this;
    }

    onEnter() {
        if (this.onEnterCallBack) {
            this.onEnterCallBack();
        }
    }

    onExit() {
        if (this.onExitCallBack) {
            this.onExitCallBack();
        }
    }

}

export class Transition<TState, TTransition>{
    value: TTransition;
    valueAsString?: string;
    nextState: TState;
    guard?: () => boolean;
    action?: () => void;
}