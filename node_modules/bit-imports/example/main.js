var amdModule = require('js/amd-module');
var cjsModule = require('js/cjs-module');

var content = document.getElementById("content");
content.innerHTML += amdModule.getName() + "<br>";
content.innerHTML += amdModule.cjsSimple() + "<br>";
content.innerHTML += cjsModule.getName();
