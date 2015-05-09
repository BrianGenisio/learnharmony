var bitimports;
var fs         = require('fs');
var fileReader = require('./src/fileReader');

// Register method to load file content from storage
fileReader.register(function read(path) {
  return new bitimports.Promise(function(resolve, reject) {
    var filecontent = '';
    var stream      = fs.createReadStream(path);

    stream.setEncoding('utf8');
    stream.on('readable', function() {
        filecontent += stream.read();
      })
      .on('end', function() {
        resolve(filecontent);
      })
      .on('error', reject);
  });
});

// Export bit imports!
module.exports = bitimports = require('./src/bit-imports');
