var Utils = require("./utils");

var Type = {
  "UNKNOWN" : "UNKNOWN",
  "AMD"     : "AMD",     //Asynchronous Module Definition
  "CJS"     : "CJS",     //CommonJS
  "IIFE"    : "IIFE"     //Immediately-Invoked Function Expression
};


/**
 * - Loading means that the module meta is currently being loaded. Only for ASYNC
 *  processing.
 *
 * - Loaded means that the module meta is all processed and it is ready to be
 *  built into a Module instance. Only for SYNC processing.
 *
 * - Pending means that the module meta is already loaded, but it needs it's
 *  dependencies processed, which might lead to further loading of module meta
 *  objects. Only for ASYNC processing.
 */
var State = {
  LOADING: "loading",
  LOADED:  "loaded",
  PENDING: "pending"
};


function Module(options) {
  if (!options) {
    throw new TypeError("Must provide options to create the module");
  }

  if (options.hasOwnProperty("code")) {
    this.code = options.code;
  }

  if (options.hasOwnProperty("factory")) {
    this.factory = options.factory;
  }

  this.type = options.type || Type.UNKNOWN;
  this.id   = options.id || options.name;
  this.name = options.name;
  this.deps = options.deps ? options.deps.slice(0) : [];
}


/**
 * Module meta object
 */
function Meta(options) {
  options = options || {};

  if (Utils.isString(options)) {
    options = {
      name: options
    };
  }

  // Make sure we have a an ID for the module meta
  options.id = options.id || options.name;

  if (!Utils.isString(options.name)) {
    throw new TypeError("Must provide a name, which is used by the resolver to create a location for the resource");
  }

  if (!Utils.isArray(options.deps)) {
    delete options.deps;
    this.deps = [];
  }

  this.configure(options);
}


Meta.prototype.configure = function(options) {
  return Utils.extend(this, options);
};


/**
 * Verifies that the module meta object is either already compiled or can be compiled.
 *
 * @returns {boolean}
 */
Meta.validate = function(moduleMeta) {
  if (!moduleMeta) {
    throw new TypeError("Must provide options");
  }

  if (!Meta.isCompiled(moduleMeta) && !Meta.canCompile(moduleMeta)) {
    throw new TypeError("ModuleMeta must provide a `source` string or `code`.");
  }
};


/**
 * Verifies is the module meta object has dependencies.
 *
 * @returns {boolean}
 */
Meta.hasDependencies = function(moduleMeta) {
  return moduleMeta.deps && moduleMeta.deps.length;
};


/**
 * A module meta object is considered compiled if it has a `code` or `factory` method.
 * That's because those are the two things that the compile step actually generates
 * before creating a Module instance.
 *
 * @returns {boolean}
 */
Meta.isCompiled = function(moduleMeta) {
  return moduleMeta.hasOwnProperty("code") || Utils.isFunction(moduleMeta.factory);
};


/**
 * Checks if the module meta object can be compiled by verifying that it has NOT
 * already been compiled and that it has a `source` property that need to be compiled.
 *
 * @returns {boolean}
 */
Meta.canCompile = function(moduleMeta) {
  return !Meta.isCompiled(moduleMeta) && Utils.isString(moduleMeta.source);
};


Module.Meta  = Meta;
Module.Type  = Type;
Module.State = State;
module.exports = Module;
