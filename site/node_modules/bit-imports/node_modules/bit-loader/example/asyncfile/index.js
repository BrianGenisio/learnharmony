var fileReader  = require("./fileReader");
var compiler    = require("./compiler");
var resolvePath = require("./resolvePath");
var Bitloader   = require("bit-loader");
var Utils       = Bitloader.Utils;


var loader = new Bitloader({
  resolve: resolvePath,
  fetch: fileReader,
  compile: compiler
});


// Load two modules
loader
  .import(["js/sample1.js", "js/sample2.js"])
  .then(function(result) {
    console.log(result[0], result[1]);
  }, Utils.reportError);


module.exports = loader;
