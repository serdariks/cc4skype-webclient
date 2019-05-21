import { Injectable } from "@angular/core";

declare var Microsoft: any;
declare var ciLoaded:any;
@Injectable()
export class DynamicsChannelIntegration{
    
    environment:any;

    constructor(){
        this.tryInit();
    }

    tryInit(){

        if(ciLoaded){
            this.init();
        }else{
            window.setTimeout(this.tryInit,200);
        }

    }
    init() {

        console.log("dci. in init()");

        Microsoft.CIFramework.setClickToAct(true);
        Microsoft.CIFramework.addHandler("onclicktoact", this.clickToActHandler);
        Microsoft.CIFramework.addHandler("onmodechanged", this.modeChangedHandler);
        Microsoft.CIFramework.addHandler("onpagenavigate", this.pageNavigateHandler);
        Microsoft.CIFramework.addHandler("onsendkbarticle", this.sendKBArticleHandler);
        //phone = new Phone(DisplayMode.Minimized);
        //log("Added handlers for the panel");

        console.log("dci. after handlers");

        Microsoft.CIFramework.getEnvironment().then(function (res) {
            console.log("dci. environment result" + res);
            this.environment = JSON.parse(res);
        });

        console.log("dci. after get environment");

    }

    private clickToActHandler(){

    }
    private modeChangedHandler(){

    }
    private pageNavigateHandler(){

    }
    private sendKBArticleHandler(){

    }

    /* Search, and optionally open the record using CIF API searchAndOpenRecords()
     * searchOnly - when 'true', search but do not open the record, when 'false', also open the record
     * recordid - An optional CRM record Id to open. If not passed a search based on current phone number will be performed */
    updateCallerDetailsFromCRM(number:string,searchOnly:boolean, recordId:string, 
        onCallerDetailsReceived:(details:{name:string,contactId:string})=>void) {

        if (!number) {
            return; //Not a phone number or another search in progress
        }
        //log("Trying to find name of caller " + this.number + " with searchOnly=" + searchOnly);

        var query = "?$select=fullname&$filter=";   //In this sample, we are retrieving the 'fullname' attribute of the record
        if (recordId) { //oData query to retrieve a specific record
            query += "contactid eq " + recordId;
        }
        else {  //oData query to search all records for current phone number
            query += "contains(mobilephone, '" + number.substring(1) + "') or contains(mobilephone, '" + number.substring(2) + "') or contains(mobilephone, '" + number.substring(3) + "')";
        }
        //In this sample, we search all 'contact' records
        Microsoft.CIFramework.searchAndOpenRecords("contact", query, searchOnly).then(
            function (valStr) {    //We got the CRM contact record for our search query
                try {
                    let val = JSON.parse(valStr);
                    
                    //Record the fullname and CRM record id
                    onCallerDetailsReceived({name:val[0].fullname,contactId:val[0].contactid});
                    this._name = val[0].fullname;
                    this._contactid = val[0].contactid;
                    //log("The caller name is " + val[0].fullname);
                    //this.renderCallerName();

                }
                catch (e) {
                    //log("Unable to find caller name- Exception: " + e);
                }
            }.bind(this)
        ).catch(function (reason) {
            if (!reason) {
                reason = "Unknown Reason";
            }
            //log("Couldn't retrieve caller name because " + reason.toString());
        });
    }    
     /* Create a new activity record for this phone call using appropriate CIF APIs. */
     createCallActivity(callActivity:CallActivity,onCallActivityCreated:(CreateCallActivityResult)=>void) {
        var phActivity :any = {};
        //Setup basic details of the activity - subject, direction, duration
        phActivity["phonenumber"] = callActivity.number;
        phActivity["subject"] = "Call with " + name + " at " ;
        //+ this._timer.startTime.toLocaleTimeString();
        phActivity["directioncode"] = callActivity.direction == CallDirection.Incoming ? false : true;
        //phActivity["actualdurationminutes"] = Math.trunc(this._timer.duration / 60);
        //Capture any call notes as 'description' attribute of the activity
        phActivity["description"] = callActivity.description;

        var sysuser = null;
        if (callActivity.userId) {
            //sysuser = this.stripParens(this.currentEnvironment.userId);
            sysuser = callActivity.userId;
        }

        var us = {};

        //If we have the CRM contact record, use it to setup the calling parties for this activity
        if (sysuser && callActivity.contactId) {
            us["partyid_systemuser@odata.bind"] = "/systemusers(" + sysuser + ")";
            us["participationtypemask"] = (callActivity.direction == CallDirection.Incoming ? 2 : 1);

            var them = {};
            them["partyid_contact@odata.bind"] = "/contacts(" + callActivity.contactId + ")";
            them["participationtypemask"] = (callActivity.direction == CallDirection.Incoming ? 1 : 2);

            var parties = [];
            parties[0] = us; parties[1] = them;
            phActivity.phonecall_activity_parties = parties;
        }

        //If any case/incident was created, set it as the 'regarding' object; else just set the contact
        if (callActivity.currentCase) {
            //phActivity["regardingobjectid_incident@odata.bind"] = "/incidents(" + this.stripParens(this.currentCase) + ")";
            phActivity["regardingobjectid_incident@odata.bind"] = "/incidents(" + callActivity.currentCase + ")";
        } else if(callActivity.contactId) {
            phActivity["regardingobjectid_contact@odata.bind"] = "/contacts(" + callActivity.contactId + ")";
        }
        
        console.log("will save call activity");

        //Now invoke CIF to create the phonecall activcity
        Microsoft.CIFramework.createRecord("phonecall", JSON.stringify(phActivity)).then(function (newActivityStr) {
            console.log("NewActivityString:" + newActivityStr);
            let newActivity = JSON.parse(newActivityStr);
            onCallActivityCreated({activityId:newActivity.id});
            //this._activityId = newActivity.id;
            //$("#activityLink").show();
        });

        console.log("saved call activity");
    }


/* Update the activity record with additional details. In this sample, we update the 'description' field with the notes taken during the call */
    updateActivity(req:UpdateActivityRequest) {
    
    //if (!phone || phone.state != PhoneState.CallSummary) {
    //    return;
    //}
    if (!req.activityId) {
        //phone.createCallActivity();
        return;
    }
    var data = {};
    data["description"] =req.callNotes; 
    Microsoft.CIFramework.updateRecord("phonecall", req.activityId, JSON.stringify(data)).then(function (ret) {
        this.openActivity(req.activityId);
    });
}

/* Event handler. When clicked, opens the activity record created for this phone call */
    openActivity(activityId:string) {
    var ef = {};
    ef["entityName"] = "phonecall";
    if (activityId) {
        ef["entityId"] = activityId; 
    }
    Microsoft.CIFramework.openForm(JSON.stringify(ef));
}


//Invoke CIF APIs to create a new case record.
//This will open the case create form with certain fields like contactId and description pre-populated */
createCase(req:CreateCaseRequest,onCaseCreated:(CaseCreatedResult)=>void) {
    var ef = {};
    ef["entityName"] = "incident";
    var fp = {};
    fp["customerid"] = req.contactId; //prepopulate some fields we know
    fp["customeridtype"] = "contact";
    fp["caseorigincode"] = 1;
    fp["description"] = req.callNotes;
    //Now invoke CIF API
    Microsoft.CIFramework.openForm(JSON.stringify(ef), JSON.stringify(fp)).then(function (resultStr) {
        let result = JSON.parse(resultStr);
        //Once the form is opened and saved, CIF will return the newly created recordId. Save it for later use
        result["savedEntityReference"].forEach(function (elem) {
            if (elem.entityType == "incident") 
            {
                onCaseCreated({id:elem.id,name:elem.name});

                //phone.currentCase = elem.id;
                //$('#caseLink').text(elem.name)
                //$('#caseLink').show();
                return;
            }
        });
    }); 
}

/* Event handler. When clicked, opens the case record created for this phone call */
openCase(req:openCaseRequest) {
    var ef = {};
    ef["entityName"] = "incident";
    if (req.currentCase) {
        ef["entityId"] = req.currentCase;
    }
    Microsoft.CIFramework.openForm(JSON.stringify(ef));
}
  
}


export enum CallDirection{
    Incoming,
    Outgoing,
}

export class CallActivity{
    number:string;
    name:string;
    contactId:string;
    direction:CallDirection;
    description:string;
    userId:string;
    currentCase:string;
}

export class UpdateActivityRequest{

    activityId:string;
    callNotes:string;

}

export class CreateCaseRequest{
    contactId:string;
    callNotes:string;
}

export class CreateCallActivityResult{
    activityId:string;
    callNotes:string;
}

export class CaseCreatedResult{
    id:string;
    name:string;
}

export class openCaseRequest{
    currentCase:string;
}
