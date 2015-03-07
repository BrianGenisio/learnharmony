var require;
require = (function() {
  var importer = Bitimports.config({
    "baseUrl": "../",
    "paths": {
      "mocha": "node_modules/mocha/mocha",
      "chai": "node_modules/chai/chai"
    },
    "shim": {
      "mocha": {
        "exports": "mocha"
      }
    },
    "transforms": [{
      name: "ignore",
      handler: ignore,
      ignore:["chai", "dist/amd-resolver"]
    }],
    "urlArgs": 'bust=' + (new Date()).getTime()
  });

  /**
   * Simple filter for excluding particular modules from being processed by the transformation pipeline.
   */
  function ignore(moduleMeta) {
    var ignoreList = this.ignore;
    return !(ignoreList && ignoreList.length && ignoreList.indexOf(moduleMeta.name) !== -1);
  }

  return importer.require;
})();
