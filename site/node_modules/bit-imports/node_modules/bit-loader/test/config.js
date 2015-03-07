/* jshint -W098 */
var require = (function() {
/* jshint +W098 */
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
    },
    "transforms": [{
      name: "ignore",
      handler: ignore,
      ignore: ["chai", "dist/bit-loader"]
    }]
  });

  /**
   * Simple filter for excluding particular modules from being processed by the transformation pipeline.
   */
  function ignore(moduleMeta) {
    var ignoreList = this.ignore;
    return !(ignoreList && ignoreList.length && ignoreList.indexOf(moduleMeta.name) !== -1);
  }

  bitimports.Logger.enableAll();
  return importer.require;
}());
