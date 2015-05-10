var fileReader  = require("./src/fileReader");
var resolvePath = require("./src/resolvePath");
var Bitloader   = require("bit-loader");
var babel       = require("babel-bits");


/**
 * Create bit loader with a fetch core hook for reading files from storage
 */
var bitloader = new Bitloader();


/**
 * Setup a babel transform
 */
bitloader.plugin("js", {
  resolve: resolvePath.configure({baseUrl: __filename}),
  fetch: fileReader,
  transform: babel
});


/**
 * Import two modules. One with just ES2015 and the other with React JSX and ES2015
 */
bitloader.import(["./js/Name.js", "./js/HelloWorld.jsx"]).then(function(result) {
  console.log(result[0] + "\n" + result[1]);
});
