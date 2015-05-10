/* jshint unused: false, undef: false */
var require = (function() {
  var importer = bitimports.config({
    "baseUrl": "../",
    "paths": {
      "chai": "../node_modules/chai/chai"
    },
    "shim": {
      "mocha": {
        "exports": "mocha"
      }
    },
    "urlArgs": 'bust=' + (new Date()).getTime()
  });

  // Add modules to exclude from pipeline processing
  importer.ignore(["chai", "dist/amd-resolver"]);

  bitimports.Logger.enableAll();
  return importer.require;
})();
