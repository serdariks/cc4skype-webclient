export class Globals{
    presenceitems = [
        {value:"Offline",text:"Offline",imagePath:"assets/img/status/Status_Icon_Offline.png"},
        {value:"Busy",text:"Busy",imagePath:"assets/img/status/Status_Icon_Busy.png"},
        {value:"Online",text:"Online",imagePath:"assets/img/status/Status_Icon_Available.png"},
        {value:"DoNotDisturb",text:"DND",imagePath:"assets/img/status/Status_Icon_DND.png"},
        {value:"Away",text:"Away",imagePath:"assets/img/status/Status_Icon_Away.png"},
      ];

     /*  Available
Busy
Do not disturb
Be right back
Off work
Away */
      lyncSDKToApiPresenceMap = [
          {sdkValue:'Available',apiValue:'Online'},
          {sdkValue:'Busy',apiValue:'Busy'},
          {sdkValue:'In a conference call',apiValue:'Busy'},
          {sdkValue:'Do not disturb',apiValue:'DoNotDisturb'},
          {sdkValue:'Be right back',apiValue:'Away'},
          {sdkValue:'Off work',apiValue:'Away'},
          {sdkValue:'Away',apiValue:'Away'},
          {sdkValue:'Offline',apiValue:'Offline'},
      ];

      /*
      None = 0,
        Online = 3000,
        IdleOnline = 4500,
        Busy = 6000,
        IdleBusy = 7500,
        DoNotDisturb = 9000,
        BeRightBack = 12000,
        Away = 15000,
        Offline = 18000
      */

      contactCenterApiToLyncApiPresenceMap = [
        {ccValue:'Online',apiValue:'Online'},
        {ccValue:'IdleOnline',apiValue:'Online'},
        {ccValue:'Busy',apiValue:'Busy'},
        {ccValue:'IdleBusy',apiValue:'Busy'},
        {ccValue:'DoNotDisturb',apiValue:'DoNotDisturb'},
        {ccValue:'BeRightBack',apiValue:'Away'},
        {ccValue:'Away',apiValue:'Away'},
        {ccValue:'Offline',apiValue:'Offline'},
      ];

      getApiPresenceForContactCenterPresence(ccPresence:string):string
      {
          let presenceMapItem = this.contactCenterApiToLyncApiPresenceMap.find(p=>p.ccValue == ccPresence);

          if(presenceMapItem){
            return presenceMapItem.apiValue;
          }else{
            return null;
          }
      }

      getApiPresenceForLyncSDKPresence(lyncSDKPresence:string):string
      {
          let presenceMapItem = this.lyncSDKToApiPresenceMap.find(p=>p.sdkValue == lyncSDKPresence);
          if(presenceMapItem){
            return presenceMapItem.apiValue;
          }else{
            return null;
          }
      }

      findPresenceItem(itemValue:string):{value:string,text:string,imagePath:string}{
        
        let item = this.presenceitems.find(i=>i.value == itemValue);

        return item;

           
      }
}