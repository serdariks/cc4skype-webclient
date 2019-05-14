import { Component, OnInit } from '@angular/core';
import { LyncApiContainer } from '../../lync-api/lync-api-container';
import { LyncApiAudioService } from '../../lync-api/lync-api-audio-service';

@Component({
  selector: 'app-meeting-join',
  templateUrl: './meeting-join.component.html',
  styleUrls: ['./meeting-join.component.css']
})
export class MeetingJoinComponent implements OnInit {

  private lyncApiAudioService:LyncApiAudioService;

  constructor(private apiContainer:LyncApiContainer) 
  { 
    this.lyncApiAudioService = apiContainer.currentApi.audioService;
  }

  ngOnInit() {
  }

  onEnterMeeting(meetingUrl:string){

    this.lyncApiAudioService.joinMeeting(meetingUrl);

  }

}
