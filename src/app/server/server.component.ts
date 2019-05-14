import { Component, OnInit, Input } from '@angular/core';
import { ServerDTO } from '../dto/server-dto';
import { AnotherService } from '../another-service';
import { SubjectTestService } from '../subject-test-service';

@Component({
  selector: 'app-server',
  templateUrl: './server.component.html',
  styleUrls: ['./server.component.css']
})
export class ServerComponent implements OnInit {
  
  @Input()server:ServerDTO;

  dateSummary:string;
  constructor(private anotherService:AnotherService,private subjectTestService:SubjectTestService) { 

    anotherService.dataGenerated.subscribe((d)=>{

      this.dateSummary = d;

    });

  }

  receivedSubjectValue:string;

  ngOnInit() {

    this.subjectTestService.mySubject.subscribe((value)=>{

      console.log('Server: (' + this.server.name + ') received subject value: (' + value + ')');
      this.receivedSubjectValue = value;

    });
  }

}
