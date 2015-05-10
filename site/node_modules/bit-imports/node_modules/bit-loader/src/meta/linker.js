var Module = require("../module");
var logger = require("../logger").factory("Module/Linker");


/**
 * The linker step is where we take the evaluated source, build all the dependencies
 * and call the factory method on the module if available.
 *
 * This is the step where the Module instance is finally created.
 *
 * @returns {Module}
 */
function MetaLinker(manager, moduleMeta) {
  // Make this is compiled or can be linked.
  if (!Module.Meta.isCompiled(moduleMeta)) {
    throw new TypeError("Module " + moduleMeta.name + " cannot be linked");
  }

  function traverseDependencies(mod) {
    logger.log(mod.name, mod);

    // Get all dependencies to feed them to the module factory
    var deps = mod.deps.map(function resolveDependency(mod_name) {
      if (mod.meta && mod.meta.builtins && mod.meta.builtins.hasOwnProperty(mod_name)) {
        return mod.meta.builtins[mod_name];
      }

      if (manager.isModuleCached(mod_name)) {
        return manager.getModuleCode(mod_name);
      }

      return traverseDependencies(manager.getModule(mod_name)).code;
    });

    if (mod.factory && !mod.hasOwnProperty("code")) {
      mod.code = mod.factory.apply(undefined, deps);
    }

    return mod;
  }

  // Create module instance...
  var _module = new Module(moduleMeta);

  // We will coerce the name no matter what name (if one at all) the Module was
  // created with. This will ensure a consistent state in the loading engine.
  _module.name = moduleMeta.name;

  // Set the mod.meta for convenience
  _module.meta = moduleMeta;

  // Link it
  return traverseDependencies(_module);
}

module.exports = MetaLinker;
