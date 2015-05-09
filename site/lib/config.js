var System = (function() {
  var importer = bitimports.config({
    "paths": {
      "babel": "node_modules/babel-bits/dist/index.min.js"
    }
  });

  importer.plugin("js", {
    "transform": ["babel"]
  });

  importer.ignore({
    match: ["babel"]
  });

  return importer;
})();

var require = System.require;
