(function() {
  "use strict";

  var Promise = require('spromise'),
      Module  = require('../module'),
      Utils   = require('../utils'),
      Logger  = require('../logger'),
      logger  = Logger.factory("Meta/Fetch");

  function MetaFetch(manager, name, parentMeta) {
    logger.log(name);

    return Promise.resolve(manager.fetch(name, parentMeta))
      .then(moduleFetched, Utils.forwardError);

    // Once the module meta is fetched, we want to add helper properties
    // to it to facilitate further processing.
    function moduleFetched(moduleMeta) {
      if (!(moduleMeta instanceof Module.Meta)) {
        Module.Meta.validate(moduleMeta);
        moduleMeta.deps = moduleMeta.deps || [];
      }

      moduleMeta.name = name;
      return moduleMeta;
    }
  }

  module.exports = MetaFetch;
})();
