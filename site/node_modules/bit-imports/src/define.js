/**
 * @class
 *
 * Interface for AMD modules `define`. It handles anonymous and named module definitions
 * with a variatery of `define` signatures.
 */
function Define() {
}


/**
 * Defines a module to be loaded and consumed by other modules.  Two types of
 * modules come through here, named and anonymous.
 */
Define.prototype.define = function () {
  var mod     = Define.adapters.apply(this, arguments),
      context = this._getContext();

  if (mod.name) {
    // Do no allow modules to override other modules...
    if (context.modules.hasOwnProperty(mod.name)) {
      throw new Error("Module " + mod.name + " is already defined");
    }
    else {
      context.modules[mod.name] = mod;
    }
  }
  else {
    context.anonymous.push(mod);
  }
};


/**
 * Processes the current context making sure that any anonymous module definitions
 * are properly converted to named defintions when applicable.
 */
Define.prototype.getDefinitions = function(name) {
  var context = this._clearContext();

  // define was never called...
  if (!context) {
    return;
  }

  var anonymous = context.anonymous,
      modules   = context.modules,
      mod       = modules[name];

  if (!mod && anonymous.length) {
    mod      = anonymous.shift();
    mod.name = name;
    modules[mod.name] = mod;
  }

  if (modules[name]) {
    delete modules[name];
  }

  if (mod) {
    mod.modules = modules;
  }

  return mod;
};


/**
 * Gets the current context.  If it does not exist, one is created.
 *
 * @private
 */
Define.prototype._getContext = function() {
  return this.context || (this.context = {
    modules: {},
    anonymous: []
  });
};


/**
 * Deletes and returns the current context.
 *
 * @private
 */
Define.prototype._clearContext = function() {
  var context = this.context;
  delete this.context;
  return context;
};


/**
 * Adapter interfaces to define modules
 *
 * @private
 */
Define.adapters = function (name, deps, factory) {
  var signature = ["", typeof name, typeof deps, typeof factory].join("/");
  var adapter   = Define.adapters[signature];

  if (!adapter) {
    throw new TypeError("Module define signature isn't valid: " + signature);
  }

  return adapter.apply(this, arguments);
};


/*
 * Creates an object with relevant information from a `define` call
 */
Define.adapters.create = function (name, deps, factory) {
  var moduleMeta = {
    name: name,
    deps: deps
  };

  if (typeof(factory) === "function") {
    moduleMeta.factory = factory;
  }
  else {
    moduleMeta.code = factory;
  }

  return moduleMeta;
};


/*
 * This is a table for quickly detecting the signature that `define` was called
 * with.  This is just a much more direct execution path than building blocks
 * of if statements.
 */
Define.adapters["/string/object/function"]        = function (name, deps, factory) { return Define.adapters.create.call(this, name, deps, factory); };
Define.adapters["/string/function/undefined"]     = function (name, factory)       { return Define.adapters.create.call(this, name, [], factory); };
Define.adapters["/object/function/undefined"]     = function (deps, factory)       { return Define.adapters.create.call(this, undefined, deps, factory); };
Define.adapters["/object/undefined/undefined"]    = function (data)                { return Define.adapters.create.call(this, undefined, [], data); };
Define.adapters["/string/object/undefined"]       = Define.adapters["/string/function/undefined"];
Define.adapters["/function/undefined/undefined"]  = Define.adapters["/object/undefined/undefined"];
Define.adapters["/string/undefined/undefined"]    = Define.adapters["/object/undefined/undefined"];
Define.adapters["/number/undefined/undefined"]    = Define.adapters["/object/undefined/undefined"];
Define.adapters["/undefined/undefined/undefined"] = Define.adapters["/object/undefined/undefined"];

module.exports = Define;
