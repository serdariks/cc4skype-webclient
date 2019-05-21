import { Component, OnInit } from '@angular/core';
import { DynamicsChannelIntegration } from '../web-client/services/dynamics-channel-integration';

@Component({
  selector: 'app-dynamics-test',
  templateUrl: './dynamics-test.component.html',
  styleUrls: ['./dynamics-test.component.css']
})
export class DynamicsTestComponent implements OnInit {

  constructor(private dynamicsChannelIntegration:DynamicsChannelIntegration) { }

  ngOnInit() {
  }

}
