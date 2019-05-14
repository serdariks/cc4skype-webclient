import {Subject } from "rxjs";
import { Person } from "../lync-api/lync-api-person";

export class ContactsService{
    contacts = new Subject<Person[]>();
}