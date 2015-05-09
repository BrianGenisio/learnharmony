(function() {
  "use strict";

  var Promise = require('promise'),
      Plugin  = require('../plugin'),
      Utils   = require('../utils'),
      logger  = require('logger').factory("Meta/Tranform");

  /**
   * The transform enables transformation providers to process the moduleMeta
   * before it is compiled into an actual Module instance.  This is where steps
   * such as linting and processing coffee files can take place.
   */
  function MetaTransform(manager, moduleMeta) {
    logger.log(moduleMeta.name, moduleMeta);

    if (manager.rules.ignore.match(moduleMeta.name, "transform")) {
      return Promise.resolve(moduleMeta);
    }

    function transformationFinished() {
      return moduleMeta;
    }

    if (runPlugins(moduleMeta.plugins)) {
      return manager.pipelines.transform
        .run(moduleMeta.plugins, moduleMeta, Plugin.createCanExecute(moduleMeta))
        .then(transformationFinished, Utils.forwardError);
    }
    else {
      return manager.pipelines.transform
        .runAll(moduleMeta, Plugin.createCanExecute(moduleMeta))
        .then(transformationFinished, Utils.forwardError);
    }
  }


  function runPlugins(plugins) {
    return plugins && plugins.length && !(plugins.length === 1 && !plugins[0]);
  }


  module.exports = MetaTransform;
})();
