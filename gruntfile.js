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
      },
      markdown: {
        files: 'site/src/**/*.md',
        tasks: ['pages']
      }
    },

    jshint: {
      options: {
        evil: true,
        esnext: true
      },
      src: ['site/src/**/*.js', '!site/src/**/*.template.js', '!site/src/**/*.page.js']
    },

    pages: {
      lessons: {
        baseDir: 'site/src/pages/markdown/',
        src: ['site/src/pages/markdown/**/*.md'],
        processed: 'site/src/pages/processed',
        routes: 'site/src/routes.js'
      }
    }
  });


  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-http-server');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['jshint', 'pages']);
  grunt.registerTask('serve', ['http-server:dev', 'pages', 'watch']);
}