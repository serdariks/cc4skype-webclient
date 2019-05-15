import * as io from 'socket.io-client';

import { EventEmitter, Injectable } from '@angular/core';
import { LoggingService } from '../../logging-service';
import { ConfigService } from '../services/config-service';
import { Configuration } from '../services/configuration';


@Injectable()
export class SocketManager{

    socket:SocketIOClient.Socket;   
    socketId;
    localIP:any; 
    userName:string;     
    
    onInitialized: EventEmitter<any> = new EventEmitter<any>();
    onReconnect:EventEmitter<any> = new EventEmitter<any>();

    private config:Configuration;
    constructor(private configService:ConfigService,private logger:LoggingService)
    {
        this.config = configService.Config;
    }

    initialize(){
        this.connect((socketConnectedArgs)=>{
            this.onInitialized.emit({socketId:socketConnectedArgs.socketId});
        });
    }

    get socketServerAddress(){

        let address:string = '';

        let socketServerDomain:string= '';

        //in development mode, usually socket server and angular server are same

        if(this.config.socketServerIsOnTheSameDomain) 
        {
            //if it's configured to be the same we can get socket server address from domain in current url.
            socketServerDomain = window.location.hostname;
        }
        else
        {
            socketServerDomain = this.config.socketServerDomain;

        }

        if(this.config.socketServerPort && this.config.socketServerPort !='')
        {
            address = `${socketServerDomain}:${this.config.socketServerPort}`; 
        }
        else
        {
            address = `${socketServerDomain}`;
        }

        return address;

    }

    private connect(onConnected?:(socketConnectedArgs)=>void)
    {	      
        if (this.socket) {
			(<any>this.socket).destroy();
			delete this.socket;
			this.socket = null;
		} 

        //this.socket =  io('http://serdar.cc4skype.local:8085',{ forceNew: true });
        //this.socket =  io('http://serdar.cc4skype.local:8085',{ reconnection: false });

        

        this.socket =  io(this.socketServerAddress,{ reconnection: false });           

        this.logger.log('socket manager: new socket initialized.')
    
        this.socket.on('mySocketConnected',(value)=> {  

            //this.socket = value;
                        
                      
           /* if(this.disconnected){ */

               /*  this.logger.log('socket manager: socket was previously disconnected, so now it will be reinitialize');

                this.socket.close();
                delete this.socket;
                this.disconnected = false;
                this.initialize(); */
                //location.reload();
            /*     return;
            }  */
            
            this.socketId = value.socketId;

            let handshakeAddressParts = value.handshakeAddress.split(':');

            this.localIP = handshakeAddressParts[handshakeAddressParts.length-1];

            this.logger.log(`socket manager: local IP:(${this.localIP})`);

            this.logger.log(`socket manager: on mySocketConnected:${value.socketId} ${JSON.stringify(value.handshakeAddress)} ${value.dummyText}`);

            this.socket.emit('receivedConnectedFeedback',{message:'Client connected feedback from client socket: ' + value.socketId});		                        
    
            if(this.lastServiceName)
            {
                this.registerService(this.lastServiceName);
            }

            this.roomsJoined.forEach(r=>this.joinRoom(r)); 
            
            //this.joinRoom(`WebClient_${this.localIP}`);
            this.joinRoom(this.webAddress);

            if(onConnected)
            {
                onConnected(value);            
            }

        });

        this.socket.on('connect',(value)=>{
            this.disconnected = false;
            this.logger.log('socket manager: client socket connected.');                        
        });

        this.socket.on('disconnect',(value)=>{
            this.disconnected = true;
            let interval = window.setInterval(()=>{
                
                if(this.disconnected)
                {
                    this.connect((socketConnectedArgs)=>{
                        this.onReconnect.emit(socketConnectedArgs);
                    });
                }else
                {
                    window.clearInterval(interval);
                }

            },5000);
            this.logger.log('socket manager: client socket disconnected.');
        });
    
    };

    get webAddress():string
    {
        if(this.userName)
        {
            return `webClient_${this.localIP}_${this.userName}`;
        }else{
            return `webClient_${this.localIP}`;
        }
    }

    disconnected:boolean=true;

    roomsJoined:string[] = new Array<string>();
    lastServiceName:string;

    joinRoom(room:string)
    {                    
        this.logger.log(`socket manager: will join room:${room}`);

        try
        {
            this.socket.emit('join',room);
            this.roomsJoined.push(room);            

        }catch(error){

            this.logger.log('socket manager: error: ' + error);
        }        
        
    }
    
    leaveRoom(room:string)
    {

        this.logger.log(`socket manager: will leave room:${room}`);

        let roomIndex=  this.roomsJoined.findIndex(r=>r == room);

        this.roomsJoined.splice(roomIndex,1);

        this.socket.emit('leave',room);
    }

    registerService(serviceName:string)
    {

        this.logger.log(`socket manager: will register service:${serviceName}`);

        try
        {
            this.socket.emit('registerService',{serviceName:serviceName});

            this.lastServiceName = serviceName;

        }
        catch(error)
        {
            this.logger.log('socket manager: error: ' + error);
        }                

    }
    unRegisterService(serviceName:string)
    {
        this.lastServiceName = null;

        this.logger.log(`socket manager: will unregister service:${serviceName}`);

        this.socket.emit('unRegisterService',{serviceName:serviceName});
    }

}