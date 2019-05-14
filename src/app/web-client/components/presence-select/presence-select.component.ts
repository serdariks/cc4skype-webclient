import { Component, OnInit, Input, SimpleChanges, OnChanges, Output, EventEmitter } from '@angular/core';
import { Globals } from '../../services/globals';

@Component({
  selector: 'app-presence-select',
  templateUrl: './presence-select.component.html',
  styleUrls: ['./presence-select.component.css']
})
export class PresenceSelectComponent implements OnInit,OnChanges {

  constructor(private globals:Globals) { }

  @Input()selectedValue:string;
  selectedText:string;
  selectedImagePath:string;
  @Output()select = new EventEmitter<string>();

  items:Array<{value:string,text:string,imagePath:string}>=[];
  ngOnInit()
  {
    this.items = this.globals.presenceitems;
    
    this.onSelected(this.selectedValue);
  }

  ngOnChanges(changes:SimpleChanges):void{

    if(changes.selectedValue)
    {
      //this.onSelected(changes.selectedValue.currentValue);
      this.setSelected(changes.selectedValue.currentValue);
    }
  }

  onSelected(itemValue:string)
  {
    this.selectedValue = itemValue;
    
    let item = this.items.find(i=>i.value == itemValue);

    if(item){
      this.selectedText = item.text;
      this.selectedImagePath = item.imagePath;
      this.select.next(itemValue);
    }    
    
  }  

  setSelected(itemValue:string)
  {
    //this.selectedValue = itemValue;
    
    let item = this.items.find(i=>i.value == itemValue);

    if(item){
      this.selectedText = item.text;
      this.selectedImagePath = item.imagePath;     
    }    
    
  }  

}
