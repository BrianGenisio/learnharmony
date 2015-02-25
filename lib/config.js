var System = (function() {
  var importer = bitimports.config({
    "paths": {
      "babel": "node_modules/babel-bits/dist/index.min.js"
    },
    "transforms": [
      {
        name: "ignore",
        handler: ignore,
        ignore: ["babel"]
      }, {
        name: "babel"
      }
    ]
  });

  /**
   * Simple filter for excluding particular modules from being processed by the transformation pipeline.
   */
  function ignore(moduleMeta) {
    var ignoreList = this.ignore;
    return !(ignoreList && ignoreList.length && ignoreList.indexOf(moduleMeta.name) !== -1);
  }

  return importer;
})();

var require = System.require;
