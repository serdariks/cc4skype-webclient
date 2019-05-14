import { Component, OnInit } from '@angular/core';
import { ServerDTO } from '../dto/server-dto';


@Component({
  selector: 'app-servers',
  templateUrl: './servers.component.html',
  styleUrls: ['./servers.component.css']
})
export class ServersComponent implements OnInit {

  serverCreationStatus:string = 'server is not created';

  servers:ServerDTO[]=[
    {id:1,name:"server1",status:true},
    {id:2,name:"server2",status:true},
    {id:3,name:"server3",status:true}
  ];  

  constructor() {    
     
   
  }

  ngOnInit() {

  } 

  onServerCreated(server:ServerDTO){         

    let cnt = this.servers.length + 1;

    server.id = cnt;
    //server.name = "server" + cnt;
    server.status = true;

    this.servers.push(server);

    //this.servers.push({id:cnt,name:"server" + cnt ,status:true});

  }

}
