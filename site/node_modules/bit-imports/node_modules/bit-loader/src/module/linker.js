(function(root) {
  "use strict";

  var Logger = require('../logger'),
      logger = Logger.factory("Module/Linker");

  function ModuleLinker(manager, mod) {
    function traverseDependencies(mod) {
      logger.log(mod.name, mod);

      // Get all dependencies to feed them to the module factory
      var deps = mod.deps.map(function resolveDependency(mod_name) {
        if (manager.isModuleCached(mod_name)) {
          return manager.getModuleCode(mod_name);
        }

        return traverseDependencies(manager.getModule(mod_name)).code;
      });

      if (mod.factory && !mod.hasOwnProperty("code")) {
        mod.code = mod.factory.apply(root, deps);
      }

      return mod;
    }

    return manager.setModule(traverseDependencies(mod));
  }

  module.exports = ModuleLinker;
})(typeof(window) !== 'undefined' ? window : this);
