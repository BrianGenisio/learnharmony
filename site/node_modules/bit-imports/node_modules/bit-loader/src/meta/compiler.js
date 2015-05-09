(function() {
  "use strict";

  var Promise = require('promise'),
      Module  = require('../module'),
      logger  = require('logger').factory("Meta/Compiler");

  /**
   * The compile step is to convert the moduleMeta to an instance of Module. The
   * fetch provider is in charge of adding the compile interface in the moduleMeta
   * as that is the place with the most knowledge about how the module was loaded
   * from the server/local file system.
   */
  function MetaCompiler(manager, moduleMeta) {
    logger.log(moduleMeta.name, moduleMeta);

    if (manager.rules.ignore.match(moduleMeta.name, "compiler")) {
      return Promise.resolve();
    }

    var mod;
    if (Module.Meta.canCompile(moduleMeta)) {
      mod = manager.compile(moduleMeta);
    }
    else if (Module.Meta.isCompiled(moduleMeta)) {
      mod = new Module(moduleMeta);
    }

    if (mod) {
      // We will coerce the name no matter what name (if one at all) the Module was
      // created with. This will ensure a consistent state in the loading engine.
      mod.name = moduleMeta.name;

      // Set the mod.meta for convenience
      mod.meta = moduleMeta;
      return mod;
    }
  }

  module.exports = MetaCompiler;
})();
