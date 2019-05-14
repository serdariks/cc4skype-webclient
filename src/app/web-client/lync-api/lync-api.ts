import { LyncApiAudioService } from "./lync-api-audio-service";
import { LyncApiContacts } from "./lync-api-contacts";
import { LyncApiGlobals } from "./lync-api-globals";
import { LyncApiInitializer } from "./lync-api-initializer";
import { LyncApiSignIn } from "./lync-api-signin";
import { LyncApiPresence } from "./lync-api-presence";
import { LyncApiNote } from "./lync-api-note";

export interface LyncApi
{
    audioService:LyncApiAudioService;
    contactsService:LyncApiContacts;
    globals:LyncApiGlobals;
    initializer:LyncApiInitializer;
    presence:LyncApiPresence;
    note:LyncApiNote;
    signIn:LyncApiSignIn;

}