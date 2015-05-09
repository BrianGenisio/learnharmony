var streamProvider = require('promjax');
var fileReader     = require('./src/fileReader');

// Register method to load file content from storage
fileReader.register(streamProvider);

// Export bit imports!
module.exports = require('./src/bit-imports');
