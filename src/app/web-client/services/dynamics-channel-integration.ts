import { Injectable } from "@angular/core";
import { OutboundCall } from "./outbound-call";
import { CallSessionTimer } from "./call-session-timer";

declare var Microsoft: any;
declare var ciLoaded: any;
@Injectable()
export class DynamicsChannelIntegration {

    environment: any;

    constructor(private outBoundCall:OutboundCall,private callSessionTimer:CallSessionTimer) {
        this.tryInit();
    }

    tryInit() {

        if (ciLoaded) {
            this.init();
        } else {
            window.setTimeout(this.tryInit, 200);
        }

    }
    init() {

        console.log("dci. in init()");

        Microsoft.CIFramework.setClickToAct(true);
        Microsoft.CIFramework.addHandler("onclicktoact", this.clickToActHandler.bind(this));
        Microsoft.CIFramework.addHandler("onmodechanged", this.modeChangedHandler);
        Microsoft.CIFramework.addHandler("onpagenavigate", this.pageNavigateHandler);
        Microsoft.CIFramework.addHandler("onsendkbarticle", this.sendKBArticleHandler);
        //phone = new Phone(DisplayMode.Minimized);
        //log("Added handlers for the panel");

        console.log("dci. after handlers");

        Microsoft.CIFramework.getEnvironment().then(function(res){
            console.log("dci. environment result" + res);
            this.environment = JSON.parse(res);
        }.bind(this));

        console.log("dci. after get environment");

    }

    clickToActHandler(paramStr) {

        let keepThis = this;

        return new Promise(function (resolve, reject) {
            try {
                let params = JSON.parse(paramStr);
                //var phNo = params.value;   //Retrieve the phone number to dial from parameters passed by CIF
                console.log("Click To Act placing a phone call to " + paramStr);

                keepThis.outBoundCall.start(params.value).then((result)=>{
          
                    console.log(`click-to-act. outbound-call result: ${result}`);
                });
               
                resolve(true);
            }
            catch (error) {
                console.log("Error on Click To Act" + error);
                reject(error);
            }
        });

    }
    private modeChangedHandler() {

    }
    private pageNavigateHandler() {

    }
    private sendKBArticleHandler() {

    }

    searchContacts(keyword: string): Promise<DynamicsContact[]> {

        return new Promise<DynamicsContact[]>((resolve, reject) => {
            this.updateCallerDetailsFromCRM(keyword, true, null, (contacts) => {
                resolve(contacts);
            });

        });

    }

    searchContactsAndOpen(keyword: string): Promise<DynamicsContact[]> {

        return new Promise<DynamicsContact[]>((resolve, reject) => {
            this.updateCallerDetailsFromCRM(keyword, false, null, (contacts) => {
                resolve(contacts);
            });

        });

    }

    /* Search, and optionally open the record using CIF API searchAndOpenRecords()
     * searchOnly - when 'true', search but do not open the record, when 'false', also open the record
     * recordid - An optional CRM record Id to open. If not passed a search based on current phone number will be performed */
    updateCallerDetailsFromCRM(keyword: string, searchOnly: boolean, recordId: string,
        onCallerDetailsReceived: (details: DynamicsContact[]) => void) {

        if (!keyword && keyword !='') {
            return; //Not a phone number or another search in progress
        }
        //log("Trying to find name of caller " + this.number + " with searchOnly=" + searchOnly);

        var query = "?$select=fullname,mobilephone&$filter=";   //In this sample, we are retrieving the 'fullname' attribute of the record
        if (recordId) { //oData query to retrieve a specific record
            query += "contactid eq " + recordId;
        }
        else {  //oData query to search all records for current phone number
            query += "contains(mobilephone, '" + keyword.substring(1) + 
            "') or contains(mobilephone, '" + keyword.substring(2) + 
            "') or contains(mobilephone, '" + keyword.substring(3) + 
            "') or contains(fullname, '" + keyword + "')";
        }
        //In this sample, we search all 'contact' records
        Microsoft.CIFramework.searchAndOpenRecords("contact", query, searchOnly).then(
            function(valStr){    //We got the CRM contact record for our search query
                try {
                    let val:[any] = <[any]>JSON.parse(valStr);

                    //Record the fullname and CRM record id

                    let contacts: DynamicsContact[] = [];
                    
                    for(var index in val){
                        let v = val[index];
                        
                        let contact:DynamicsContact = <DynamicsContact>{
                            fullName:v.fullname,contactId:v.contactid,mobilePhone:v.mobilephone
                        }

                        contacts.push(contact);
                    }

                 /*    let contacts1:DynamicsContact[] = val.map(v=>{return <DynamicsContact>{
                        fullName:v.fullname,contactId:v.contactid,mobilePhone:v.mobilephone
                    };}); */
                    
                    onCallerDetailsReceived(contacts);
                    //this._name = val[0].fullname;
                    //this._contactid = val[0].contactid;
                    //log("The caller name is " + val[0].fullname);
                    //this.renderCallerName();

                }
                catch (e) {
                    onCallerDetailsReceived(null);
                    //log("Unable to find caller name- Exception: " + e);
                }
            }.bind(this)
        ).catch(function(reason){
            if (!reason) {
                reason = "Unknown Reason";
            }
            //log("Couldn't retrieve caller name because " + reason.toString());
        }.bind(this));
    }
    /* Create a new activity record for this phone call using appropriate CIF APIs. */
    createCallActivity(callActivity: CallActivity, onCallActivityCreated: (CreateCallActivityResult) => void) {        

        var phActivity: any = {};
        //Setup basic details of the activity - subject, direction, duration
        phActivity["phonenumber"] = callActivity.number;
        //phActivity["subject"] = "Call with " + callActivity.number + " at "+ this.callSessionTimer.startTime.toLocaleTimeString();
        phActivity["directioncode"] = callActivity.direction == CallDirection.Incoming ? false : true;
        phActivity["actualdurationminutes"] = Math.trunc(this.callSessionTimer.duration / 60);
        //Capture any call notes as 'description' attribute of the activity
        phActivity["description"] = callActivity.description;

        var sysuser = null;
        if (this.environment) {
            sysuser = this.stripParens(this.environment.userId);
            //sysuser = callActivity.userId;
        }    
        
        var parties = [];
        //If we have the CRM contact record, use it to setup the calling parties for this activity
        if (sysuser) {
            var us = {};

            us["partyid_systemuser@odata.bind"] = "/systemusers(" + sysuser + ")";
            us["participationtypemask"] = (callActivity.direction == CallDirection.Incoming ? 2 : 1);

            parties[0] = us;
        }

        this.searchContacts(callActivity.number).then( contacts => {
            

            if (contacts.length > 0) {
                callActivity.contactId = this.stripParens(contacts[0].contactId);
            }
            

            if (callActivity.contactId) {
               
                var them = {};
                them["partyid_contact@odata.bind"] = "/contacts(" + callActivity.contactId + ")";
                them["participationtypemask"] = (callActivity.direction == CallDirection.Incoming ? 1 : 2);

                parties[1] = them;

                
            }

            phActivity.phonecall_activity_parties = parties;

            let contactStr:string = callActivity.contactId ? contacts[0].fullName : callActivity.number; 

            phActivity["subject"] = "Call with " + contactStr + " at "+ this.callSessionTimer.startTime.toLocaleTimeString();


            //If any case/incident was created, set it as the 'regarding' object; else just set the contact
            if (callActivity.currentCase) {
                //phActivity["regardingobjectid_incident@odata.bind"] = "/incidents(" + this.stripParens(this.currentCase) + ")";
                phActivity["regardingobjectid_incident@odata.bind"] = "/incidents(" + callActivity.currentCase + ")";
            } else if (callActivity.contactId) {
                phActivity["regardingobjectid_contact@odata.bind"] = "/contacts(" + callActivity.contactId + ")";
            }

            console.log("will save call activity");

            //Now invoke CIF to create the phonecall activcity
            Microsoft.CIFramework.createRecord("phonecall", JSON.stringify(phActivity)).then(function(newActivityStr){
                console.log("NewActivityString:" + newActivityStr);
                let newActivity = JSON.parse(newActivityStr);
                onCallActivityCreated({ activityId: newActivity.id });
                //this._activityId = newActivity.id;
                //$("#activityLink").show();
            }.bind(this));

            console.log("saved call activity");


        });

    }

    getPhoneCallActivities():Promise<any[]>{

        return new Promise<any[]>((resolve,reject)=>{

            Microsoft.CIFramework.searchAndOpenRecords("phonecall").then(
                function(queryResponse){    
                    try {
                        let val:[any] = <[any]>JSON.parse(queryResponse);
                        
                        let phoneCalls: any[] = [];
                        
                        for(var index in val){
                            let phoneCall = val[index];                                                       
    
                            phoneCalls.push(phoneCall);
                        }

                        resolve(phoneCalls);
                     
                    }
                    catch (e) {
                        reject(e);
                    }
                }.bind(this)
            ).catch(function(reason){
                if (!reason) {
                    reason = "Unknown Reason";
                }

                reject(reason);
                
            }.bind(this));

        });

        
    }

    private stripParens(val) {
        var start = val.indexOf('{') + 1, end = val.lastIndexOf('}');
        end = (end > 0 ? end : val.length);
        return val.substring(start, end);
    }

    /* Update the activity record with additional details. In this sample, we update the 'description' field with the notes taken during the call */
    updateActivity(req: UpdateActivityRequest): Promise<string> {

        return new Promise<string>((resolve, reject) => {
            //if (!phone || phone.state != PhoneState.CallSummary) {
            //    return;
            //}
            if (!req.activityId) {
                //phone.createCallActivity();
                return;
            }
            var data = {};
            data["description"] = req.callNotes;
            Microsoft.CIFramework.updateRecord("phonecall", req.activityId, JSON.stringify(data)).then(function (ret) {
                this.openActivity(req.activityId);
                resolve(req.activityId);
            }.bind(this));
        });

    }

    /* Event handler. When clicked, opens the activity record created for this phone call */
    openActivity(activityId: string) {
        var ef = {};
        ef["entityName"] = "phonecall";
        if (activityId) {
            ef["entityId"] = activityId;
        }
        Microsoft.CIFramework.openForm(JSON.stringify(ef));
    }


    //Invoke CIF APIs to create a new case record.
    //This will open the case create form with certain fields like contactId and description pre-populated */
    createCase(req: CreateCaseRequest, onCaseCreated: (CaseCreatedResult) => void) {
        var ef = {};
        ef["entityName"] = "incident";
        var fp = {};
        fp["customerid"] = req.contactId; //prepopulate some fields we know
        fp["customeridtype"] = "contact";
        fp["caseorigincode"] = 1;
        fp["description"] = req.callNotes;
        //Now invoke CIF API
        Microsoft.CIFramework.openForm(JSON.stringify(ef), JSON.stringify(fp)).then(function(resultStr){
            let result = JSON.parse(resultStr);
            //Once the form is opened and saved, CIF will return the newly created recordId. Save it for later use
            result["savedEntityReference"].forEach(function (elem) {
                if (elem.entityType == "incident") {
                    onCaseCreated({ id: elem.id, name: elem.name });

                    //phone.currentCase = elem.id;
                    //$('#caseLink').text(elem.name)
                    //$('#caseLink').show();
                    return;
                }
            });
        }.bind(this));
    }

    /* Event handler. When clicked, opens the case record created for this phone call */
    openCase(req: openCaseRequest) {
        var ef = {};
        ef["entityName"] = "incident";
        if (req.currentCase) {
            ef["entityId"] = req.currentCase;
        }
        Microsoft.CIFramework.openForm(JSON.stringify(ef));
    }


    testsearchContacts() {

        let entityLogicalName: string = "contact";
        let queryStr: string = "";
        let searchOnly: boolean = true;

        // retrieve contact record
        Microsoft.CIFramework.searchAndOpenRecords(entityLogicalName, queryStr, searchOnly).then(
            function(result){
                console.log(result);
                //var res=JSON.parse(result);
                //console.log(`Record values: Full Name: ${res[0].fullname}, Telephone Number: ${res[0].telephone1}`);
                // perform operations on record retrieval and opening
            }.bind(this),
            function(error){
                console.log(error.message);
                // handle error conditions
            }.bind(this)
        );
    }

}


export enum CallDirection {
    Incoming,
    Outgoing,
}

export class CallActivity {
    number: string;
    name: string;
    contactId: string;
    direction: CallDirection;
    description: string;
    userId: string;
    currentCase: string;
}

export class UpdateActivityRequest {

    activityId: string;
    callNotes: string;

}

export class CreateCaseRequest {
    contactId: string;
    callNotes: string;
}

export class CreateCallActivityResult {
    activityId: string;
    callNotes: string;
}

export class CaseCreatedResult {
    id: string;
    name: string;
}

export class openCaseRequest {
    currentCase: string;
}

export class DynamicsContact{
    fullName:string;
    contactId:string;
    mobilePhone:string;

}
