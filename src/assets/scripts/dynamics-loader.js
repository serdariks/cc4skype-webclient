console.log('THIS IS DYNAMICS LOADER');

var args = window.location.search.substr(1).split('&');

let baseUrlArg = args.map(a=>{
      let argParts = a.split('=');
      return {key:argParts[0],value:argParts[1]};
    }).find(a=>a.key == 'base');

console.log(baseUrlArg);

var script = document.createElement('script');
script.onload = function () {
    //do stuff with the script
    ciLoaded = true;
};

script.src = decodeURIComponent(baseUrlArg.value + '/webresources/Widget/msdyn_ciLibrary.js');
//script.src = "https://cc4skypesb.crm4.dynamics.com/webresources/Widget/msdyn_ciLibrary.js";
document.head.appendChild(script);