import { Subject } from "rxjs";
import { Person } from "./lync-api-person";

export interface LyncApiSignIn{

    userSignedIn:Subject<string>;
    userSignedOut:Subject<string>;

    signIn(username,password):Promise<Person>;
    signOut():Promise<any>;

}