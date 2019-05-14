import { WebSDKApi } from "../web-sdk/web-sdk-api";
import { LyncApi } from "./lync-api";
import { Injectable } from "@angular/core";
import { LyncSDKApi } from "../lync-sdk/lync-sdk-api";

@Injectable()
export class LyncApiContainer
{
    currentApi:LyncApi;
    constructor(private webSDKApi:WebSDKApi,private lyncSDKApi:LyncSDKApi){
        this.currentApi = webSDKApi;
        /* this.currentApi = lyncSDKApi; */
    }

    setLyncAPI(apiType:LyncApiType)
    {
        if(apiType == LyncApiType.webSDK)
        {
            this.currentApi = this.webSDKApi;
        }
        else if(apiType == LyncApiType.lyncSDK)
        {
            this.currentApi = this.lyncSDKApi;

        }

    }
    
}

export enum LyncApiType{
    webSDK,
    lyncSDK,
}