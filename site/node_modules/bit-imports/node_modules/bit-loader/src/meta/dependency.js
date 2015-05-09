(function() {
  "use strict";

  var Promise = require('promise'),
      Module  = require('../module'),
      Utils   = require('../utils'),
      logger  = require('logger').factory("Meta/Dependency");


  /**
   * Loads up all dependencies for the module
   *
   * @returns {Function} callback to call with the Module instance with the
   *   dependencies to be resolved
   */
  function MetaDependency(manager, moduleMeta) {
    logger.log(moduleMeta.name, moduleMeta);

    if (manager.rules.ignore.match(moduleMeta.name, "dependency")) {
      return Promise.resolve(moduleMeta);
    }

    function dependenciesFinished() {
      // Return if the module has no dependencies
      if (!Module.Meta.hasDependencies(moduleMeta)) {
        return moduleMeta;
      }

      return loadDependencies(manager, moduleMeta);
    }

    if (runPlugins(moduleMeta.plugins)) {
      return manager.pipelines.dependency
        .run(moduleMeta.plugins, moduleMeta)
        .then(dependenciesFinished, Utils.forwardError);
    }
    else {
      return manager.pipelines.dependency
        .runAll(moduleMeta)
        .then(dependenciesFinished, Utils.forwardError);
    }
  }


  function loadDependencies(manager, moduleMeta) {
    var i, length, loading = new Array(moduleMeta.deps.length);

    for (i = 0, length = moduleMeta.deps.length; i < length; i++) {
      loading[i] = manager.providers.loader.fetch(moduleMeta.deps[i], moduleMeta);
    }

    function dependenciesFetched() {
      return moduleMeta;
    }

    return Promise.all(loading).then(dependenciesFetched, Utils.forwardError);
  }


  function runPlugins(plugins) {
    return plugins && plugins.length && !(plugins.length === 1 && !plugins[0]);
  }


  module.exports = MetaDependency;
})();
