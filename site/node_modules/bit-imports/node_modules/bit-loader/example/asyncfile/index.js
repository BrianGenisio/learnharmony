var fs = require('fs');
var Bitloader = require('../../dist/bit-loader.js');
var Utils = Bitloader.Utils;
var loader = new Bitloader({}, {fetch: fetchFactory});

// Load two modules
loader.import(["js/sample1.js", "js/sample2.js"]).then(function(r1, r2) {
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


  // Return fetch interface
  return {
    // The only interface that is needed by bit loader
    fetch: function(name) {
      // Read file from disk and return a module meta
      return readFile(name)
        .then(moduleMetaFactory, Utils.forwardError);
    }
  };
}


/**
 * Read file from storage.  You can very easily replace this with a routine that
 * loads data using XHR.
 */
function readFile(fileName) {
  return new Bitloader.Promise(function(resolve, reject) {
    var filecontent = '';
    var stream = fs.createReadStream(__dirname + '/' + fileName);
    stream.setEncoding('utf8');

    stream.on('readable', function() {
      filecontent += stream.read();
    });

    stream.on('end', function() {
      resolve(filecontent);
    });

    stream.on('error', reject);
  });
}


module.exports = loader;
