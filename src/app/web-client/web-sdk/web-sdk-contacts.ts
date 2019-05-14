import { Injectable } from "@angular/core";
import { WebSDKGlobals } from "./web-sdk-globals";
import { LyncApiContacts } from "../lync-api/lync-api-contacts";
import { WebSDKCache } from "./web-sdk-cache";
import { Person } from "../lync-api/lync-api-person";
import { resolve } from "q";

@Injectable()
export class WebSDKContacts implements LyncApiContacts{
    constructor(private globals:WebSDKGlobals,private cache:WebSDKCache){

    }

    //persons;

    getAll():Promise<Person[]>
    {

        return new Promise<Person[]>((resolve,reject)=>{

            let resp = this.globals.client.personsAndGroupsManager.all.persons.get().then((persons)=>{
                //this.persons = persons;
                let personCache = this.cache.persons;
                let personsConverted = personCache.convertToPersons(persons);                
                personCache.addOrUpdatePersons(persons);

                resolve(personsConverted);
                console.log(personsConverted);
            }).catch((error)=>{
                reject(error);
            });

        });       

        
    }

    getPerson(id:string):Promise<Person>{

        return new Promise<Person>((resolve,reject)=>{

            var personSearchQuery = this.globals.client.personsAndGroupsManager.createPersonSearchQuery();
            personSearchQuery.text(id);
            personSearchQuery.limit(50);
            personSearchQuery.getMore().then( 
                
                personsObj=> {
                
                    let persons: Array<any> = [];

                    personsObj.forEach(pObj => {
                        persons.push(pObj.result);    
                    });
            
                    let personCache = this.cache.persons;

                    let personsConverted = personCache.convertToPersons(persons);                
                    personCache.addOrUpdatePersons(persons);

                    resolve(personsConverted[0]);
                   
                }, 
                error=>{
                    reject(error);
                });
            });
        

    }

    
}

/* class FakeWebSDKPerson
{
    constructor(private pObj:any){

    }
    displayName(){
        return this.pObj.result.displayName();
    }
    id(){
        return this.pObj.result.id();
    }       
} */