import { Component, OnInit } from '@angular/core';
import { LoggingService } from '../../../logging-service';
import { CacheService } from '../../services/cache-service';

@Component({
  selector: 'app-log-view',
  templateUrl: './log-view.component.html',
  styleUrls: ['./log-view.component.css']
})
export class LogViewComponent implements OnInit {

  constructor(private loggingService:LoggingService,private cacheService:CacheService) { }
  
  /* logs:string[]=[]; */

  filteredLogs:string[]=[];

  ngOnInit() {

    this.onFilterChange('');
  
    this.loggingService.logGenerated.subscribe((message:string)=>
    {
      /*   this.logs.push(message); */

        if(!this.lastFilterValue || this.lastFilterValue=='' || message.indexOf(this.lastFilterValue)>-1){
          this.filteredLogs.push(message);
        }

    });
  }

  onClear()
  {
    this.lastFilterValue = null;
    this.cacheService.logs.length = 0;
    this.filteredLogs.length = 0;
  }

  lastFilterValue:string='';

  onFilterChange(filterValue:string){
    
    this.lastFilterValue = filterValue;

    this.filteredLogs = this.cacheService.logs.filter(l=>l.indexOf(filterValue)>-1);

  }

}
