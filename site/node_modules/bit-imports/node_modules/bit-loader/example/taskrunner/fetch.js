var fs        = require('fs');
var Bitloader = require('bit-loader');
var Utils     = Bitloader.Utils;


/**
 * FetchFactory provides a fetch interface that is used by bit loader
 * to load files from storage.
 *
 * @private
 *
 * @param {Bitloader} loader - bit loader instance
 */
function fetchFactory(loader) {
  // Compile is called with the module meta as the context.
  function compile() {
    return new loader.Module({code: (void 0)});
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
 * Read file from storage.  You can very easily replace this with a routine
 * that loads data using XHR.
 *
 * @private
 *
 * @param {string} fileName - Name of the file to read
 *
 * @returns {Promise}
 */
function readFile(fileName) {
  return new Bitloader.Promise(function(resolve, reject) {
    var filecontent = '';
    var stream = fs.createReadStream(__dirname + '/' + fileName);
    stream.setEncoding('utf8');

    stream
      .on('readable', function() {
        filecontent += stream.read();
      })
      .on('end', function() {
        resolve(filecontent);
      })
      .on('error', reject);
  });
}


module.exports = fetchFactory;
