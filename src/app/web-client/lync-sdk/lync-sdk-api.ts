import { Injectable } from "@angular/core";

import { LyncApi } from "../lync-api/lync-api";
import { LyncApiGlobals } from "../lync-api/lync-api-globals";
import { LyncSDKAudioService } from "./lync-sdk-audio-service";
import { LyncSDKContacts } from "./lync-sdk-contacts";
import { LyncSDKInitializer } from "./lync-sdk-initializer";
import { LyncSDKPresence } from "./lync-sdk-presence";
import { LyncSDKSignIn } from "./lync-sdk-signin";
import { LyncSDKNote } from "./lync-sdk-note";
import { LyncApiAudioService } from "../lync-api/lync-api-audio-service";
import { LyncApiContacts } from "../lync-api/lync-api-contacts";
import { LyncApiInitializer } from "../lync-api/lync-api-initializer";
import { LyncApiPresence } from "../lync-api/lync-api-presence";
import { LyncApiNote } from "../lync-api/lync-api-note";
import { LyncApiSignIn } from "../lync-api/lync-api-signin";

@Injectable()
export class LyncSDKApi implements LyncApi{
    
    audioService:LyncApiAudioService;
    contactsService:LyncApiContacts;
    globals:LyncApiGlobals;
    initializer:LyncApiInitializer;
    presence:LyncApiPresence;
    note:LyncApiNote;
    signIn:LyncApiSignIn;

    constructor(audioService:LyncSDKAudioService,contactsService:LyncSDKContacts,globals:LyncApiGlobals
        ,initializer:LyncSDKInitializer,presence:LyncSDKPresence,note:LyncSDKNote, signIn:LyncSDKSignIn)
    {
        this.audioService = audioService;
        this.contactsService = contactsService;
        this.globals = globals;
        this.initializer = initializer;
        this.presence = presence;
        this.signIn = signIn;
        this.note = note;

    }
}