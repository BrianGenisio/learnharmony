var fm = require('front-matter');
var md = require('github-flavored-markdown');

module.exports = function(grunt) {

  grunt.registerMultiTask(
    'pages', 
    'process the pages into ES6 modules',
    processPages);

  function processPages() {
    var pages = [];
    var baseDir = this.data.baseDir;

    this.files.forEach(function(list) {
      list.src.forEach(function(filePath) {
        var src = grunt.file.read(filePath);
        var destPath = filePath.replace('.md', '.page.js');

        try {
          var parsed = fm(src);
        } catch(e) {
          grunt.log.warn('failed to parse front matter (' + src + '): ' + e.problem + ' line ' + e.problem_mark.line);
        }

        parsed.body = md.parse(parsed.body);
        
        var result = parsed.attributes;
        result.intro = parsed.body;

        var output = "export var page = " + JSON.stringify(result, null, 4) + ";"

        grunt.file.write(destPath, output);

        pages.push(getPageDescriptor(baseDir || '', filePath, result));
      });
    });

    var output = 'export var routes = ' + JSON.stringify(pages, null, 4) + ';';

    grunt.file.write(this.data.routes, output);
  }

  function getPageDescriptor(baseDir, filePath, arguments) {
    var page = filePath.replace(baseDir, '');
    page = page.replace('.md', '');

    var result = {
      page: page,
      title: arguments.title || arguments.heading,
      navGroup: arguments.navGroup
    };

    if(arguments.route) {
      result.route = arguments.route;
    }

    return result;
  }
};