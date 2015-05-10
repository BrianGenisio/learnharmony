var fs        = require("fs");
var pstream   = require("./pstream");
var Bitloader = require("bit-loader");
var Utils     = Bitloader.Utils;


/**
 * Function that reads file from disk
 *
 * @param {object} moduleMeta - Module meta with information about the module being loaded
 */
function fileReader(moduleMeta) {
  function fileRead(text) {
    moduleMeta.configure({
      source: text
    });
  }

  // Read file from disk and return a module meta
  return readFile(moduleMeta.path).then(fileRead, Utils.reportError);
}


/**
 * Read file from storage.  You can very easily replace this with a routine
 * that loads data using XHR.
 *
 * @private
 *
 * @param {string} filePath - Full path for the file to be read
 *
 * @returns {Promise}
 */
function readFile(filePath) {
  var stream = fs
    .createReadStream(filePath)
    .setEncoding("utf8");

  return pstream(stream);
}


module.exports = fileReader;
