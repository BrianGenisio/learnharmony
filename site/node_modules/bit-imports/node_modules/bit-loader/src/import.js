var Promise  = require("./promise");
var Utils    = require("./utils");
var Registry = require("./registry");

var getRegistryId = Registry.idGenerator("import");

var ModuleState = {
  IMPORTING: "importing"
};


/**
 * Module importer. Primary function is to load Module instances and resolving
 * their dependencies in order to make the Module fully consumable.
 */
function Import(manager) {
  if (!manager) {
    throw new TypeError("Must provide a manager");
  }

  this.manager = manager;
  this.context = Registry.getById(getRegistryId());
}


/**
 * Import is the method to load a Module
 *
 * @param {Array<string> | string} names - module(s) to import
 *
 * @returns {Promise}
 */
Import.prototype.import = function(name, options) {
  var importer = this;

  if (typeof(name) === "string") {
    return Promise.resolve(importer._getModule(name, options));
  }

  return Promise.all(name.map(function getModuleByName(name) {
    return importer._getModule(name, options);
  }));
};


/**
 * Gets the module by name.  If the module has not been loaded before, then
 * it is loaded via the module loader
 *
 * @param {Array<string>} names - Array of module names
 * @param {Object} options
 */
Import.prototype._getModule = function(name, options) {
  options = options || {};
  var importer = this;
  var manager  = this.manager;

  if (hasModule(options.modules, name)) {
    return options.modules[name];
  }
  else if (manager.hasModule(name)) {
    return manager.getModuleCode(name);
  }
  else if (importer.hasModule(name)) {
    return importer.getModule(name);
  }

  // Wrap in a separate promise to handle this:
  // https://github.com/MiguelCastillo/spromise/issues/35
  return new Promise(function deferredModuleResolver(resolve, reject) {
    function moduleError(error) {
      reject(Utils.reportError(error));
    }

    function moduleLoaded(mod) {
      if (name !== mod.name) {
        return Promise.reject(new TypeError("Module name must be the same as the name used for loading the Module itself"));
      }

      importer.deleteModule(mod.name);
      resolve(manager.getModuleCode(mod.name));
    }

    importer.setModule(name, manager.load(name))
      .then(moduleLoaded, moduleError);
  });
};


function hasModule(target, name) {
  return target && target.hasOwnProperty(name);
}

Import.prototype.hasModule = function(name) {
  return this.context.hasModuleWithState(ModuleState.IMPORTING, name);
};

Import.prototype.getModule = function(name) {
  return this.context.getModuleWithState(ModuleState.IMPORTING, name);
};

Import.prototype.setModule = function(name, item) {
  return this.context.setModule(ModuleState.IMPORTING, name, item);
};

Import.prototype.deleteModule = function(name) {
  return this.context.deleteModule(name);
};

module.exports = Import;
