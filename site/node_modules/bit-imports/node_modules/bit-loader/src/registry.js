(function() {
  "use strict";

  var StatefulItems = require('./stateful-items');
  var storage = {};


  /**
   * Module registry
   */
  function Registry(options) {
    options = options || {};
    this._id     = options.id || getRegistryId();
    this.modules = options.modules || new StatefulItems();
  }


  Registry.prototype.clear = function() {
    if (storage.hasOwnProperty(this._id)) {
      delete storage[this._id];
    }
    return this;
  };


  Registry.prototype.hasModule = function(name) {
    return this.modules.hasItem(name);
  };


  Registry.prototype.getModule = function(name) {
    return this.modules.getItem(name);
  };


  Registry.prototype.deleteModule = function(name) {
    return this.modules.removeItem(name);
  };


  Registry.prototype.setModule = function(state, name, item) {
    return this.modules.setItem(state, name, item);
  };


  Registry.prototype.getModuleState = function(name) {
    return this.modules.getState(name);
  };


  Registry.prototype.hasModuleWithState = function(state, name) {
    return this.modules.hasItemWithState(state, name);
  };


  Registry.prototype.getModuleWithState = function(state, name) {
    return this.modules.getItemWithState(state, name);
  };


  /**
   * Factory method that creates Registries with an id
   */
  Registry.getById = function(id) {
    if (!id) {
      id = getRegistryId();
    }

    return storage[id] || (storage[id] = new Registry({id: id}));
  };


  /**
   * Destroys Registries by id.
   */
  Registry.clearById = function(id) {
    if (storage.hasOwnProperty(id)) {
      return storage[id].clear();
    }
  };


  /**
   * Creates a named id generator you can use for prefixing generated ids. The
   * idea is that you can generate ids you prefix in order to group generated
   * ids.
   *
   * @param {string} name - Name of the id generator. Provide you to
   *   customize the ids generated. Defaults to 'generic'.
   * @parem {number} seed - Seed number to start id generation from.
   *
   * @returns {function} That when called creates and returns a new
   *   unique id.
   */
  Registry.idGenerator = function(name, seed) {
    name = (name || 'generic') + '-';
    var id = seed || 0;
    return function getId() {
      return name + id++;
    };
  };


  var getRegistryId = Registry.idGenerator();
  module.exports = Registry;
})();
