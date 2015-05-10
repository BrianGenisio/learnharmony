var runPipeline = require("./runPipeline");
var Promise     = require("../promise");
var Module      = require("../module");
var Utils       = require("../utils");
var logger      = require("../logger").factory("Meta/Compiler");


function MetaCompile() {
}


/**
 * Runs compiler pipeline to give plugins a chances to compile the meta module
 * if one is registered.
 *
 * This step is asynchronous.
 */
MetaCompile.pipeline = function(manager, moduleMeta) {
  logger.log(moduleMeta.name, moduleMeta);

  if (!Module.Meta.canCompile(moduleMeta) || !canProcess(manager, moduleMeta)) {
    return Promise.resolve(moduleMeta);
  }

  function compilationFinished() {
    return moduleMeta;
  }

  return runPipeline(manager.pipelines.compile, moduleMeta)
    .then(compilationFinished, Utils.reportError);
};


/**
 * The compile step evaluates the module meta source.
 *
 * This step is synchronous.
 */
MetaCompile.compile = function(manager, moduleMeta) {
  logger.log(moduleMeta.name, moduleMeta);

  if (canProcess(manager, moduleMeta) && Module.Meta.canCompile(moduleMeta)) {
    moduleMeta.configure(manager.compile(moduleMeta));
  }
};


function canProcess(manager, moduleMeta) {
  return !manager.rules.ignore.compile.match(moduleMeta.name);
}


module.exports = MetaCompile;
