export class ActiveCallSession{
    private _instanceKey:string;
    private _conversationKey:string;
    private _sessionId:string;
    constructor(){
        this._instanceKey = null;
        this._conversationKey = null;
        this._sessionId = null;
    }
    get instanceKey(){
        return this._instanceKey;
    }
    get conversationKey(){
        return this._conversationKey;
    }
    get sessionId(){
        return this._sessionId;
    }
    get hasActiveCallSession():boolean{
        return (this.conversationKey!=null && this._instanceKey !=null);
    }
    setActiveCallSession(instanceKey:string,conversationKey:string,sessionId:string){
        this._instanceKey = instanceKey;
        this._conversationKey = conversationKey;
        this._sessionId = sessionId;
    }
    removeActiveCallSession(){
        this._instanceKey = null;
        this._conversationKey = null;
        this._sessionId = null;
    }
}