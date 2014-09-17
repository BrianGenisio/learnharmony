module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    'http-server': {
      'dev': {
        root: 'site',
        port: 8282,
        host: "127.0.0.1",
        ext: "html",
        runInBackground: true
      }
    },

    watch: {
      scripts: {
        files: 'site/src/**/*.js',
        tasks: ['jshint']
      }
    },

    jshint: {
      options: {
        evil: true,
        esnext: true
      },
      src: ['site/src/**/*.js', '!site/src/**/*.template.js', '!site/src/**/*.page.js']
    }
  });

  grunt.loadNpmTasks('grunt-http-server');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['http-server:dev', 'watch']);
}