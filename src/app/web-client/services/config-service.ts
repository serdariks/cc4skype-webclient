import { Injectable } from "@angular/core";
import { Configuration } from "./configuration";
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ConfigService{

    private config:Configuration;

    constructor(private http:HttpClient){

    }

    load(url:string):Promise<Configuration>{

        return new Promise<Configuration>((resolve,reject)=>{

           /*  this.http.get(url).subscribe(configJson=>{
                    this.config = configJson.json();
                    resolve(this.config);
                }
            ); */

            this.http.get(url).subscribe(config=>{
                this.config = <Configuration>config;
                resolve(this.config);
            }
        );
            //this.http.get(url).map(a=>a.json());

        });
        

    }

    get Config():Configuration
    {
        return this.config; 
    }


}