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
        var destPath = filePath.replace('.md', '.page.js');

        try {
          var parsed = fm(src);
        } catch(e) {
          grunt.log.warn('failed to parse front matter (' + src + '): ' + e.problem + ' line ' + e.problem_mark.line);
        }

        parsed.body = marked(parsed.body);
        grunt.log.writeln('Body: ', parsed.body)

        var result = parsed.attributes;
        result.intro = parsed.body;

        var output = "export var page = " + JSON.stringify(result, null, 4) + ";"

        grunt.file.write(destPath, output);
      });
    });
  }
};