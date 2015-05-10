var System = (function() {
  var importer = bitimports.config({
    "paths": {
      "babel": "./node_modules/babel-bits/dist/index.min.js"
    }
  });

  importer.plugin("js", {
    "transform": [{
      handler: "babel",
      options: {
        sourceMaps: "inline"
      }
    }]
  });

  return importer;
})();

var require = System.require;
