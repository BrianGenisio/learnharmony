(function() {
  "use strict";

  var Promise = require('spromise'),
      Module  = require('../module'),
      Utils   = require('../utils'),
      Logger  = require('../logger'),
      logger  = Logger.factory("Meta/Dependencies");

  /**
   * Loads up all dependencies for the module
   *
   * @returns {Function} callback to call with the Module instance with the
   *   dependencies to be resolved
   */
  function MetaDependencies(manager, moduleMeta) {
    logger.log(moduleMeta.name, moduleMeta);

    // Return if the module has no dependencies
    if (!Module.Meta.hasDependencies(moduleMeta)) {
      return Promise.resolve(moduleMeta);
    }

    var loading = moduleMeta.deps.map(function fetchDependency(mod_name) {
      return manager.providers.loader.fetch(mod_name, moduleMeta);
    });

    return Promise.all(loading)
      .then(dependenciesFetched, Utils.forwardError);

    function dependenciesFetched() {
      return moduleMeta;
    }
  }

  module.exports = MetaDependencies;
})();
