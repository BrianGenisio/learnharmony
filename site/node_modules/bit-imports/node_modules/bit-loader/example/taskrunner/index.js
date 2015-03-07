var taskRunner = require('./taskrunner');


/**
 * JavaScript pipeline
 */
function jsPipeline() {
  this
    .load("index.js")
    .then(function(moduleMeta) {
      console.log(moduleMeta);
    })
    .then(function(moduleMeta) {
      console.log(moduleMeta);
    });
}


/**
 * CoffeeScript pipeline
 */
function coffeePipeline() {
  this
    .load("taskrunner.js")
    .then(function(moduleMeta) {
      console.log(moduleMeta);
    });
}


/**
 * Minify pipeline
 */
function minifyPipeline() {
  this
    .load('.jshintrc')
    .then(function(moduleMeta) {
      console.log(moduleMeta);
    });
}


taskRunner
  .register('javascript', ['coffeescript', 'minify'], jsPipeline)
  .register('coffeescript', coffeePipeline)
  .register('minify', minifyPipeline)
  .run('minify')
  .run('javascript');
