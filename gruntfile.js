module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    'http-server': {
      'dev': {
        root: 'site',
        port: 8282,
        host: "127.0.0.1",
        ext: "html",
        runInBackground: false
      }
    }
  });

  grunt.loadNpmTasks('grunt-http-server');

  grunt.registerTask('default', ['http-server:dev']);
}