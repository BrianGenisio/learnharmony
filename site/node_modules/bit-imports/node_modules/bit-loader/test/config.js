/* jshint -W098 */
var require = (function() {
/* jshint +W098 */
  var importer = bitimports.config({
    "baseUrl": "../",
    "paths": {
      "chai": "../node_modules/chai/chai"
    }
  });

  importer.ignore({
    match: ["chai", "dist/bit-loader"]
  });

  bitimports.Logger.enableAll();
  return importer.require;
}());
