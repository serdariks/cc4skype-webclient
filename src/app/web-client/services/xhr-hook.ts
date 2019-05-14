export class XHRHook{

    private addXMLRequestCallback(callback){
        var oldSend, i;
        var xmlHTTPRequest = (<any>XMLHttpRequest)
        if( (<any>XMLHttpRequest).callbacks ) {
            // we've already overridden send() so just add the callback
            xmlHTTPRequest.push( callback );
        } else {
            // create a callback queue
            xmlHTTPRequest = [callback];
            // store the native send()
            oldSend = XMLHttpRequest.prototype.send;
            // override the native send()
            XMLHttpRequest.prototype.send = function(){
                // process the callback queue
                // the xhr instance is passed into each callback but seems pretty useless
                // you can't tell what its destination is or call abort() without an error
                // so only really good for logging that a request has happened
                // I could be wrong, I hope so...
                // EDIT: I suppose you could override the onreadystatechange handler though
                for( i = 0; i < xmlHTTPRequest.length; i++ ) {
                    xmlHTTPRequest[i]( this );
                }
                // call the native send()
                oldSend.apply(this, arguments);
            }
        }
    }
    
    addHooks()
    {

        this.addXMLRequestCallback( function( xhr ) {
            console.log( 'XHRHook:' + xhr.responseText ); // (an empty string)
        });

        this.addXMLRequestCallback( function( xhr ) {
            console.dir( xhr ); // have a look if there is anything useful here
        });

    }    
  
}