(function() {
  "use strict";

  var Promise  = require('promise'),
      Registry = require('./registry'),
      Utils    = require('./utils');

  var getRegistryId = Registry.idGenerator('import');

  var ModuleState = {
    LOADING: "loading"
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
    options = options || {};
    var importer = this;

    if (typeof(name) === "string") {
      return Promise.resolve(importer._getModule(name, options));
    }

    return Promise.all(name.map(function getModuleByName(name) {
      return importer._getModule(name, options);
    }));
  };


  /**
   * Loops through the array of names, loading whatever has not yet been loaded,
   * and returning what has already been loaded.
   *
   * @param {Array<string>} names - Array of module names
   * @param {Object} options
   */
  Import.prototype._getModule = function(name, options) {
    var importer = this,
        manager  = this.manager;

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
      importer.setModule(name, importer._loadModule(name))
        .then(function moduleSuccess(result) {
          resolve(result);
        }, function moduleError(error) {
          reject(error);
        });
    });
  };


  /**
   * Load module
   */
  Import.prototype._loadModule = function(name) {
    return this.manager
      .load(name)
      .then(this._getCodeDelegate(name), Utils.forwardError);
  };


  /**
   * Handler for when modules are loaded.
   */
  Import.prototype._getCodeDelegate = function(name) {
    var importer = this;

    return function getCodeDelegate(mod) {
      if (name !== mod.name) {
        return Promise.reject(new TypeError("Module name must be the same as the name used for loading the Module itself"));
      }

      importer.deleteModule(mod.name);
      return importer.manager.getModuleCode(mod.name);
    };
  };


  function hasModule(target, name) {
    return target && target.hasOwnProperty(name);
  }

  Import.prototype.hasModule = function(name) {
    return this.context.hasModuleWithState(ModuleState.LOADING, name);
  };

  Import.prototype.getModule = function(name) {
    return this.context.getModuleWithState(ModuleState.LOADING, name);
  };

  Import.prototype.setModule = function(name, item) {
    return this.context.setModule(ModuleState.LOADING, name, item);
  };

  Import.prototype.deleteModule = function(name) {
    return this.context.deleteModule(name);
  };

  module.exports = Import;
})();

