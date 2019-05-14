import { Injectable } from "@angular/core";
import { WebSDKAudioService } from "./web-sdk-audio-service";
import { WebSDKContacts } from "./web-sdk-contacts";
import { WebSDKInitializer } from "./web-sdk-initializer";
import { WebSDKPresence } from "./web-sdk-presence";
import { WebSDKSignIn } from "./web-sdk-signin";
import { LyncApi } from "../lync-api/lync-api";
import { LyncApiGlobals } from "../lync-api/lync-api-globals";
import { WebSDKNote } from "./web-sdk-note";
import { LyncApiAudioService } from "../lync-api/lync-api-audio-service";
import { LyncApiContacts } from "../lync-api/lync-api-contacts";
import { LyncApiInitializer } from "../lync-api/lync-api-initializer";
import { LyncApiPresence } from "../lync-api/lync-api-presence";
import { LyncApiNote } from "../lync-api/lync-api-note";
import { LyncApiSignIn } from "../lync-api/lync-api-signin";

@Injectable()
export class WebSDKApi implements LyncApi{

    audioService:LyncApiAudioService;
    contactsService:LyncApiContacts;
    globals:LyncApiGlobals;
    initializer:LyncApiInitializer;
    presence:LyncApiPresence;
    note:LyncApiNote;
    signIn:LyncApiSignIn;

    constructor(audioService:WebSDKAudioService,contactsService:WebSDKContacts,globals:LyncApiGlobals
        ,initializer:WebSDKInitializer,presence:WebSDKPresence,note:WebSDKNote,signIn:WebSDKSignIn)
    {
        this.audioService = audioService;
        this.contactsService = contactsService;
        this.globals = globals;
        this.initializer = initializer;
        this.presence = presence;
        this.note = note;
        this.signIn = signIn;

    }
}