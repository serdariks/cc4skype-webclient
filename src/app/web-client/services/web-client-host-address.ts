import { Injectable } from "@angular/core";
import { SocketManager } from "../messaging/socket-manager";

@Injectable()
export class WebClientHostAddress{
    constructor(private socketManager:SocketManager){}    
    get Value():string
    {
        if(this.socketManager.userName)
        {
            return `webClientHost_${this.socketManager.localIP}_${this.socketManager.userName}`;
        }else{
            return `webClientHost_${this.socketManager.localIP}`;
        }
    }
  
}