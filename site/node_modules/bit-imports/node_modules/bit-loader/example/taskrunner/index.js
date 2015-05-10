var taskRunner = require("./src/taskrunner");


/**
 * JavaScript pipeline
 */
function jsPipeline() {
  this
    .load("./index.js")
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
    .load("./src//taskrunner.js")
    .then(function(moduleMeta) {
      console.log(moduleMeta);
    });
}


/**
 * Minify pipeline
 */
function minifyPipeline() {
  this
    .load("../.jshintrc")
    .then(function(moduleMeta) {
      console.log(moduleMeta);
    });
}


taskRunner.configure({baseUrl: __filename})
  .register("javascript", ["coffeescript", "minify"], jsPipeline)
  .register("coffeescript", coffeePipeline)
  .register("minify", minifyPipeline)
  .run("minify")
  .run("javascript");
