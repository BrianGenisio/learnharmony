var require;
require = (function() {
  var importer = bitimports.config({
    "baseUrl": ".",
    "paths": {
      "addStrict": "transform/addStrict"
    },
    "transforms": [{
      name: "ignore",
      handler: ignore,
      ignore:["addStrict"]
    },
    "addStrict"]
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
