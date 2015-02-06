var System = (function() {

  var importer = Bitimports.config({
    "transforms": [
      {
        handler: ignore,
        ignore: ["node_modules/6to5-bits/dist/index.js"]
      }, {
        name: "node_modules/6to5-bits/dist/index.js"
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
