var Promise        = require("./promise");
var Module         = require("./module");
var Utils          = require("./utils");
var Pipeline       = require("./pipeline");
var Registry       = require("./registry");
var metaLinker     = require("./meta/linker");
var metaResolve    = require("./meta/resolve");
var metaFetch      = require("./meta/fetch");
var metaTransform  = require("./meta/transform");
var metaDependency = require("./meta/dependency");
var metaCompile    = require("./meta/compile");

var getRegistryId = Registry.idGenerator("loader");


/**
 * The purpose of Loader is to return full instances of Module.  Module instances
 * are stored in the manager's context to avoid loading the same module multiple times.
 * If the module is loaded, then we just return that.  If it has not bee loaded yet,
 * then we:
 *
 * 1. Fetch its source; remote server, local file system... You must specify a fetch
 *      provider to define how source files are retrieved
 * 2. Transform the source that was fetched.  This step enables processing of the
 *      source before it is compiled into an instance of Module.
 * 3. Compile the source that was fetched and transformed into a proper instance
 *      of Module
 * 4. Link the module
 */
function Loader(manager) {
  if (!manager) {
    throw new TypeError("Must provide a manager");
  }

  this.manager = manager;
  this.context = Registry.getById(getRegistryId());

  // Setup the pipeline
  this.pipeline = new Pipeline([
    metaResolve.pipeline,
    metaFetch.pipeline,
    metaTransform.pipeline,
    metaDependency.pipeline,
    metaCompile.pipeline
  ]);
}


/**
 * Handles the process of returning the instance of the Module if one exists, otherwise
 * the workflow for creating the instance is kicked off, which will eventually lead to
 * the creation of a Module instance
 *
 * The workflow is to take in a module name that needs to be loaded.  If a module with
 * the given name isn't loaded, then we fetch it.  The fetch call returns a promise, which
 * when resolved returns a moduleMeta. The moduleMeta is an intermediate object that contains
 * the module source from fetch and a compile method used for converting the source to an
 * instance of Module. The purporse for moduleMeta is to allow a tranformation pipeline to
 * process the raw source before building the final product - a Module instance. The
 * transformation pipeline allows us to do things like convert coffeescript to javascript.
 *
 * Primary workflow:
 * fetch     -> module name {string}
 * transform -> module meta {compile:fn, source:string}
 * load deps -> module meta {compile:fn, source:string}
 * compile module meta
 * link module
 *
 * @param {string} name - The name of the module to load.
 * @param {{path: string, name: string}} referer - Object with the
 *  location and name of the requesting module.
 *
 * @returns {Promise} - Promise that will resolve to a Module instance
 */
Loader.prototype.load = function(name, referer) {
  var loader  = this;
  var manager = this.manager;

  if (!name) {
    return Promise.reject(new TypeError("Must provide the name of the module to load"));
  }

  // Take a look if the module is already loaded
  if (manager.hasModule(name)) {
    return Promise.resolve(manager.getModule(name));
  }

  // Check if the module is fetched or registered
  if (loader.isLoaded(name) || loader.isPending(name)) {
    return Promise.resolve(build());
  }

  function build() {
    return loader.asyncBuild(name);
  }

  return loader
    .fetch(name, referer)
    .then(build, Utils.reportError);
};


/**
 * This method fetches the module meta from storage, if it is not already loaded.
 * The purpose for this method is to setup the module meta and all its dependencies
 * so that the module meta can be converted to an instance of Module synchronously.
 *
 * Use this method if the intent is to preload dependencies without actually compiling
 * module meta objects to instances of Module.
 *
 * @param {string} name - The name of the module to fetch.
 * @param {{path: string, name: string}} referer - Object with the
 *  location and name of the requesting module.
 *
 * @returns {Promise}
 */
Loader.prototype.fetch = function(name, referer) {
  var loader  = this;
  var manager = this.manager;

  if (!name) {
    return Promise.reject(new TypeError("Must provide the name of the module to fetch"));
  }

  // Take a look if the module is already loaded
  if (manager.hasModule(name)) {
    return Promise.resolve();
  }

  // Check if the module is being fetched
  if (loader.isLoading(name)) {
    return loader.getLoading(name);
  }

  function moduleMetaFinished(moduleMeta) {
    return loader.setLoaded(moduleMeta.name, moduleMeta);
  }

  // Make sure we have the props we need.
  if (referer) {
    referer = {
      name: referer.name,
      path: referer.path
    };
  }

  // Create module meta, set the referer, and start processing it.
  var moduleMeta = new Module.Meta({
    name: name,
    referer: referer
  });

  var loading = loader
    ._pipelineModuleMeta(moduleMeta)
    .then(moduleMetaFinished, Utils.reportError);

  return loader.setLoading(name, loading);
};


/**
 * Converts a module meta object to a full Module instance.
 *
 * @param {string} name - The name of the module meta to convert to an instance of Module.
 *
 * @returns {Module} Module instance from the conversion of module meta
 */
Loader.prototype.syncBuild = function(name) {
  if (this.manager.isModuleCached(name)) {
    return Promise.resolve(this.manager.getModule(name));
  }

  // Evaluates source
  this._compileModuleMeta(name);

  if (this.isPending(name)) {
    throw new TypeError("Unable to synchronously build dynamic module '" + name + "'");
  }
  else if (!this.isLoaded(name)) {
    throw new TypeError("Unable to synchronously build module '" + name + "'");
  }

  // Calls module factory
  return this._linkModuleMeta(name);
};


/**
 * Build module handling any async Module registration.  What this means is that if a module
 * is being loaded and it calls System.register to register itself, then it needs to be handled
 * as an async step because that could be loading other dependencies.
 *
 * @param {string} name - Name of the target Module
 *
 * @returns {Promise}
 */
Loader.prototype.asyncBuild = function(name) {
  var loader = this;

  if (this.manager.isModuleCached(name)) {
    return Promise.resolve(this.manager.getModule(name));
  }

  // Evaluates source
  this._compileModuleMeta(name);

  if (this.isLoaded(name)) {
    return Promise.resolve().then(function() {
      return loader._linkModuleMeta(name);
    }, Utils.reportError);
  }
  else if (!this.isPending(name)) {
    throw new TypeError("Unable to build '" + name + "'.");
  }


  //
  // Helper methods
  //

  var buildDependencies = function(moduleMeta) {
    var pending = moduleMeta.deps.map(function buildDependency(moduleName) {
      return loader.asyncBuild(moduleName);
    });

    return Promise.all(pending)
      .then(function dependenciesBuilt() {
        return moduleMeta;
      }, Utils.reportError);
  };

  var linkModuleMeta = function() {
    return loader._linkModuleMeta(name);
  };


  // Right here is where we handle dynamic registration of modules while are being loaded.
  // E.g. System.register to register a module that's being loaded
  return metaDependency.pipeline(loader.manager, loader.getModule(name))
    .then(buildDependencies, Utils.reportError)
    .then(linkModuleMeta, Utils.reportError);
};


/**
 * Interface to register a module meta that can be put compiled to a Module instance
 */
Loader.prototype.register = function(name, deps, factory, type) {
  if (this.manager.isModuleCached(name)) {
    throw new TypeError("Module '" + name + "' is already loaded");
  }

  this.setPending(name, new Module.Meta({
    name    : name,
    deps    : deps,
    factory : factory,
    type    : type
  }));
};


/**
 * Utility helper that runs a module meta object through the transformation workflow.
 * The module meta object passed *must* have a string source property, which is what
 * the transformation workflow primarily operates against.
 *
 * @param {object} moduleMeta - Module meta object with require `source` property that
 *  is processed by the transformation pipeline.
 *
 * @returns {Promise} That when resolved, the fully tranformed module meta is returned.
 *
 */
Loader.prototype.transform = function(moduleMeta) {
  if (!moduleMeta) {
    return Promise.reject(new TypeError("Must provide a module meta object"));
  }

  if (!Utils.isString(moduleMeta.source)) {
    throw Promise.reject(new TypeError("Must provide a source string property with the content to transform"));
  }

  moduleMeta.deps = moduleMeta.deps || [];
  return metaTransform.pipeline(this.manager, moduleMeta);
};


/**
 * Put a module meta object through the pipeline, which includes the transformation
 * and dependency loading stages.
 *
 * @param {Module.Meta} moduleMeta - Module meta object to run through the pipeline.
 *
 * @returns {Promise} that when fulfilled, the processed module meta object is returned.
 */
Loader.prototype.runPipeline = function(moduleMeta) {
  return this.pipeline
    .run(this.manager, moduleMeta)
    .then(pipelineFinished, Utils.reportError);

  function pipelineFinished() {
    return moduleMeta;
  }
};


/**
 * Verifies the state of the module meta object, and puts it though the processing
 * pipeline if it needs to be processed.
 *
 * If the module meta object has already been compiled, then we do not execute the
 * processing pipeline.
 *
 * @param {Module.Meta} moduleMeta - Module meta object to run through the pipeline.
 *
 * @returns {Promise} that when fulfilled, the processed module meta object is returned.
 */
Loader.prototype._pipelineModuleMeta = function(moduleMeta) {
  if (Module.Meta.isCompiled(moduleMeta)) {
    return Promise.resolve(moduleMeta);
  }

  return this.runPipeline(moduleMeta);
};


/**
 * Convert a module meta object into a proper Module instance.
 *
 * @param {string} name - Name of the module meta object to be converted.
 *
 * @returns {Module}
 */
Loader.prototype._compileModuleMeta = function(name) {
  var moduleMeta;
  var manager = this.manager;

  // If the item is ready to be linked, we skip the compilation step
  if (this.isPending(name)) {
    return;
  }

  if (this.isLoaded(name)) {
    moduleMeta = this.getModule(name);
  }
  else if (this.manager.isModuleCached(name)) {
    throw new TypeError("Module `" + name + "` is already built");
  }
  else {
    throw new TypeError("Module `" + name + "` is not loaded yet. Make sure to call `load` or `fetch` prior to calling `linkModuleMeta`");
  }

  // Compile module meta to create a Module instance
  return metaCompile.compile(manager, moduleMeta);
};


/**
 * Finalizes a Module instance by pulling in all the dependencies and calling the module
 * factory method if available.  This is the very last stage of the Module building process
 *
 * @param {Module} mod - Module instance to link
 *
 * @returns {Module} Instance all linked
 */
Loader.prototype._linkModuleMeta = function(name) {
  var moduleMeta;
  var manager = this.manager;

  if (this.manager.isModuleCached(name)) {
    throw new TypeError("Module `" + name + "` is already built");
  }
  else if (this.isLoaded(name) || this.isPending(name)) {
    moduleMeta = this.deleteModule(name);
  }
  else {
    throw new TypeError("Module `" + name + "` is not loaded yet. Make sure to call `load` or `fetch` prior to calling `linkModuleMeta`");
  }

  // Run the Module instance through the module linker
  var mod = metaLinker(manager, moduleMeta);

  // Set compiled module
  manager.setModule(mod);

  // We are all done here.
  return mod;
};


/**
 * Check if there is currently a module loading or loaded.
 *
 * @param {string} name - The name of the module meta to check
 *
 * @returns {Boolean}
 */
Loader.prototype.hasModule = function(name) {
  return this.context.hasModule(name);
};


/**
 * Method to retrieve the module meta with the given name, if one exists.  If it
 * is loading, then the promise for the pending request is returned. Otherwise
 * the actual module meta object is returned.
 *
 * @param {string} name - The name of the module meta to get
 *
 * @returns {object | Promise}
 */
Loader.prototype.getModule = function(name) {
  return this.context.getModule(name);
};


/**
 * Checks if the module meta with the given name is currently loading
 *
 * @param {string} name - The name of the module meta to check
 *
 * @returns {Boolean} - true if the module name is being loaded, false otherwise.
 */
Loader.prototype.isLoading = function(name) {
  return this.context.hasModuleWithState(Module.State.LOADING, name);
};


/**
 * Method to retrieve the module meta with the given name, if it is loading.
 *
 * @param {string} name - The name of the loading module meta to get.
 *
 * @returns {Promise}
 */
Loader.prototype.getLoading = function(name) {
  return this.context.getModuleWithState(Module.State.LOADING, name);
};


/**
 * Method to set the loading module meta with the given name.
 *
 * @param {string} name - The name of the module meta to set
 * @param {Object} item - The module meta to set
 *
 * @returns {Object} The module meta being set
 */
Loader.prototype.setLoading = function(name, item) {
  return this.context.setModule(Module.State.LOADING, name, item);
};


/**
 * Method to check if a module meta object is in a pending state, which means
 * that all it needs is have its dependencies loaded and then it's ready to
 * to be compiled.
 *
 * @param {string} name - Name of the module meta object
 *
 * @returns {Boolean}
 */
Loader.prototype.isPending = function(name) {
  return this.context.hasModuleWithState(Module.State.PENDING, name);
};


/**
 * Method to get a module meta object to the pending state.
 *
 * @param {string} name - Name of the module meta to get
 *
 * @returns {Object} Module meta object
 */
Loader.prototype.getPending = function(name) {
  return this.context.getModuleWithState(Module.State.PENDING, name);
};


/**
 * Method to set a module meta object to the pending state.
 *
 * @param {string} name - Name of the module meta object
 * @param {Object} item - Module meta object to be set
 *
 * @returns {Object} Module meta being set
 */
Loader.prototype.setPending = function(name, item) {
  return this.context.setModule(Module.State.PENDING, name, item);
};


/**
 * Method to check if a module meta with the given name is already loaded.
 *
 * @param {string} name - The name of the module meta to check.
 *
 * @returns {Boolean}
 */
Loader.prototype.isLoaded = function(name) {
  return this.context.hasModuleWithState(Module.State.LOADED, name);
};


/**
 * Method to retrieve the module meta with the given name, if one exists.
 *
 * @param {string} name - The name of the loaded module meta to set
 *
 * @returns {Object} The loaded module meta
 */
Loader.prototype.getLoaded = function(name) {
  return this.context.getModuleWithState(Module.State.LOADED, name);
};


/**
 * Method to set the loaded module meta with the given name
 *
 * @param {string} name - The name of the module meta to set
 * @param {Object} item - The module meta to set
 *
 * @returns {Object} The module meta being set
 */
Loader.prototype.setLoaded = function(name, item) {
  return this.context.setModule(Module.State.LOADED, name, item);
};


/**
 * Method to remove the module from storage
 *
 * @param {string} name - The name of the module meta to remove
 *
 * @returns {Object} The module meta being removed
 */
Loader.prototype.deleteModule = function(name) {
  return this.context.deleteModule(name);
};


module.exports = Loader;
