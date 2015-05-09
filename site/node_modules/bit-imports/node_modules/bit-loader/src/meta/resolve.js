(function() {
  "use strict";

  var Promise = require('promise'),
      Module  = require('../module'),
      Utils   = require('../utils'),
      logger  = require('logger').factory("Meta/Resolve");

  function MetaResolve(manager, name, parentMeta) {
    logger.log(name);

    var moduleMeta = new Module.Meta(name);

    return Promise.resolve(manager.resolve(moduleMeta, parentMeta))
      .then(function(meta) {
        meta = meta || {};
        if (!meta.cname) {
          meta.cname = meta.name;
        }

        delete meta.name;
        return moduleMeta.configure(meta);
      }, Utils.reportError);
  }

  module.exports = MetaResolve;
})();
