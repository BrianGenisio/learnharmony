var Plugin = require("../plugin");

function runPipeline(pipeline, moduleMeta) {
  if (runPlugins(moduleMeta.plugins)) {
    return pipeline.run(moduleMeta.plugins, moduleMeta, Plugin.createCanExecute(moduleMeta));
  }
  else {
    return pipeline.runAll(moduleMeta, Plugin.createCanExecute(moduleMeta));
  }
}

function runPlugins(plugins) {
  return plugins && plugins.length && !(plugins.length === 1 && !plugins[0]);
}

module.exports = runPipeline;
