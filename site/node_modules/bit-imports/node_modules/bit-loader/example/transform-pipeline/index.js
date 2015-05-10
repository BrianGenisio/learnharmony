var Bitloader = require("bit-loader");

var loader = new Bitloader({
  fetch: loadFile
});


// Register anonymous transform directly in the transform pipeline
loader.pipelines.transform.use(addStrict);


loader.import(["like1", "like2"]).then(function(result) {
  console.log(result[0] + "\n" + result[1]);
});


/**
 * File reader
 */
function loadFile(moduleMeta) {
  // Read file and set the source in the module meta
  moduleMeta.configure({
    source: "fetch module: " + moduleMeta.name
  });
}


/**
 * Add strict to the module before it is executed.
 */
function addStrict(moduleMeta) {
  moduleMeta.configure({
    source: ";\"use strict\";\n" + moduleMeta.source
  });
}
