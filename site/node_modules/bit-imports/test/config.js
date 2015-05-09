var require;
require = (function() {
  var importer = bitimports.config({
    "baseUrl": "../",
    "paths": {
      "mocha": "../node_modules/mocha/mocha",
      "chai": "../node_modules/chai/chai"
    },
    "shim": {
      "mocha": {
        "exports": "mocha"
      }
    }
  });

  importer.ignore({
    match: ["chai", "dist/bit-imports"]
  });

  bitimports.Logger.enableAll();
  return importer.require;
})();
