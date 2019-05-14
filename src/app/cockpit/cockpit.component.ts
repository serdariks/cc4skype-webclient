import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ServerDTO } from '../dto/server-dto';
import { LoggingService } from '../logging-service';
import { AnotherService } from '../another-service';
import { SubjectTestService } from '../subject-test-service';
import { ServiceCall} from '../web-client/messaging/service-call';
import { InvokeServiceArgs } from '../web-client/messaging/dto/invoke-service-args';

@Component({
  selector: 'app-cockpit',
  templateUrl: './cockpit.component.html',
  styleUrls: ['./cockpit.component.css'],
  //providers:[LoggingService]
})
export class CockpitComponent implements OnInit {

  constructor(private loggingService:LoggingService,private anotherService:AnotherService,private subjectTestService:SubjectTestService,private serviceCall:ServiceCall) { }

  ngOnInit() {
  }

  @Output()serverAdded = new EventEmitter<ServerDTO>();

  server:ServerDTO = new ServerDTO();

  onAddServer(serverNameInput:HTMLInputElement){

    this.loggingService.log('Server added: ' + serverNameInput.value);

    var sendServer = new ServerDTO();

    sendServer.name = serverNameInput.value;

    //var sendServer = new ServerDTO();

    //sendServer.name = this.server.name;

    this.serverAdded.emit(sendServer);

  }

  onServerNameChanged(event:Event){ 
    //let eventCasted:Event = (<Event> event);
    let value:string = (<HTMLInputElement>event.target).value;
    this.loggingService.log('Server name changed: ' + value);
    this.anotherService.test(value);
    //console.log(event.target);
  }

  refreshServerDates(){

    let d = new Date().toLocaleString();

    this.anotherService.raiseDataGenerated('Time is:' + d);
  }

  sendServerName(input){

    let serverName = input.value;

    this.subjectTestService.mySubject.next(serverName); 

  }

  testServiceCall()
  {
/*     let clientSip = 'serdar@cc4skype.local';
    let requestData =  {Sip:'sip:' + clientSip} 

    let args:InvokeServiceArgs={
      
      operation : "GetMemberships",
      
      requestData : requestData,
      
      responseHandler : {

        success:(result)=>{        
  
          console.log('GetMemberships response received: ' + JSON.stringify(result));
  
        }
        ,
        error:(err)=>{
          console.log(err);
        }
  
      }
    };

    this.serviceCall.invokeService(args); */

   /*  args.operation = 'GetMemberships';

    args.requestData = {Sip:'sip:' + clientSip};

    args.responseHandler = {

      success:(result)=>{        

        console.log('GetMemberships response received: ' + JSON.stringify(result));

      }
      ,
      error:(err)=>{
        console.log(err);
      }

    }; */

    /* this.serviceCall.invokeService(args); */

  }  

}
