var System = (function() {

  var importer = Bitimports.config({
    "transforms": [
      {
        handler: ignore,
        ignore: ["lib/6to5"]
      }, {
        name: "lib/6to5"
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
