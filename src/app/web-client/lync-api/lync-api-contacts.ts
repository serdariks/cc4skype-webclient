import { Person } from "./lync-api-person";

export interface LyncApiContacts
{
    getAll():Promise<Person[]>
    getPerson(id:string):Promise<Person>;
}