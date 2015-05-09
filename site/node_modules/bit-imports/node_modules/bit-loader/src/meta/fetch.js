(function() {
  "use strict";

  var Promise = require('promise'),
      Utils   = require('../utils'),
      logger  = require('logger').factory("Meta/Fetch");

  function MetaFetch(manager, moduleMeta) {
    logger.log(moduleMeta);

    if (manager.rules.ignore.match(moduleMeta.name, "fetch")) {
      return Promise.resolve(moduleMeta);
    }

    return Promise.resolve(manager.fetch(moduleMeta))
      .then(function(meta) {
        return moduleMeta.configure(meta);
      }, Utils.reportError);
  }

  module.exports = MetaFetch;
})();
