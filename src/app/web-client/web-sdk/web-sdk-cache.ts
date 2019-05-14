import { Person } from "../lync-api/lync-api-person";

export class WebSDKCache{
    
    persons:PersonsCache = new PersonsCache();
}

export class PersonsCache{

    persons:PersonsMap = {};

    addOrUpdate(webSDKPerson:any){
        
        let personId:string = webSDKPerson.id();

        this.persons[personId] = webSDKPerson;
    }
    remove(personId:string){
        delete this.persons[personId];
    }

    get(personId:string):any
    {
        return this.persons[personId];
    }

    convertToPerson(webSDKPerson:any):Person{

        try
        {
            console.log(webSDKPerson);
        
            return webSDKPerson ? {id:webSDKPerson.id(),displayName:webSDKPerson.displayName()} : null;

        }
        catch(error){
            return null;
        }
        
       

    }

    addOrUpdatePersons(webSDKPersons:any[]){
        
        webSDKPersons.forEach(p=>{
            this.addOrUpdate(p);
        });        
    }

    convertToPersons(webSDKPersons:any[]):Person[]{

        return webSDKPersons.map(p=>this.convertToPerson(p));

    }

}

export interface PersonsMap
{
    [personId:string]:any
}