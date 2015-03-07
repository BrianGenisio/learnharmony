var Bitloader = require('../../dist/bit-loader.js');
var loader = new Bitloader({}, {fetch: fetchFactory});

// Register anonymous transform
loader.transform.use(addStrict);

loader.import(["like1", "like2"]).then(function(r1, r2) {
  console.log(r1, r2);
});


/**
 * FetchFactory provides a fetch interface that is used by bit loader
 * to load files from storage.
 *
 * @param {Bitloader} loader - bit loader instance
 */
function fetchFactory(loader) {
  // Compile is called with the module meta as the context.
  function compile() {
    var moduleMeta = this;
    // Evaluate module meta source and return module instance
    return new loader.Module({code: evaluate(moduleMeta)});
  }


  // Execute source
  function evaluate(moduleMeta) {
    var _exports = {};
    var _module = {exports: _exports};
    /* jshint -W054 */
    (new Function("module", "exports", moduleMeta.source))(_module, _exports);
    /* jshint +W054 */
    return _module;
  }


  // Creates module meta objects that bit loader gets back
  function moduleMetaFactory(source) {
    return {
      compile: compile,
      source: source
    };
  }


  return {
    fetch: function(name) {
      console.log("fetching '" + name + "'");
      // Notice that fetch returns a simple object with a `compile` method.
      // When a `compile` method is provided, a `source` property of type
      // string must also be proivded.
      // This object returned is what we call a module meta object.
      return moduleMetaFactory("exports.result = 1;");
    }
  };
}


// Add strict to the module before it is executed.
function addStrict(moduleMeta) {
  console.log("transform '" + moduleMeta.name + "'");
  moduleMeta.source = "'use strict;'\n" + moduleMeta.source;
}
