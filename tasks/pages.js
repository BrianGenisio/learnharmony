var fm = require('front-matter');
var marked = require('marked');

module.exports = function(grunt) {

  grunt.registerMultiTask(
    'pages', 
    'process the pages into ES6 modules',
    processPages);

  function processPages() {
    this.files.forEach(function(list) {
      list.src.forEach(function(filePath) {
        var src = grunt.file.read(filePath);
        var parsed = fm(src);

        parsed.body = marked(parsed.body);

        grunt.log.writeln(JSON.stringify(parsed));
      });
    });
  }
};