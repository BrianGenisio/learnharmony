(function() {
  "use strict";

  var Promise          = require('spromise'),
      Module           = require('./module'),
      Utils            = require('./utils'),
      Pipeline         = require('./pipeline'),
      Registry         = require('./registry'),
      moduleLinker     = require('./module/linker'),
      metaFetch        = require('./meta/fetch'),
      metaTransform    = require('./meta/transform'),
      metaDependencies = require('./meta/dependencies'),
      metaCompilation  = require('./meta/compilation');


  var registryId = 0;
  function getRegistryId() {
    return 'loader-' + registryId++;
  }


  /**
   * - Loaded means that the module meta is all processed and it is ready to be
   *  built into a Module instance. Only for SYNC processing.
   *
   * - Pending means that the module meta is already loaded, but it needs it's
   *  dependencies processed, which might lead to further loading of module meta
   *  objects. Only for ASYNC processing.
   *
   * - Loading means that the module meta is currently being loaded. Only for ASYNC
   *  processing.
   */
  var ModuleState = {
    LOADING: "loading",
    LOADED:  "loaded",
    PENDING: "pending"
  };


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
   */
  function Loader(manager) {
    if (!manager) {
      throw new TypeError("Must provide a manager");
    }

    this.manager  = manager;
    this.context  = Registry.getById(getRegistryId());
    this.pipeline = new Pipeline([metaTransform, metaDependencies]);
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
   * compile moduleMeta
   * link module
   *
   * @param {string} name - The name of the module to load.
   *
   * @returns {Promise} - Promise that will resolve to a Module instance
   */
  Loader.prototype.load = function(name, parentMeta) {
    var loader  = this,
        manager = this.manager;

    if (!name) {
      return Promise.reject(new TypeError("Must provide the name of the module to load"));
    }

    if (manager.hasModule(name)) {
      return Promise.resolve(manager.getModule(name));
    }

    if (loader.isLoaded(name) || loader.isPending(name)) {
      return Promise.resolve(buildModule());
    }

    return loader
      .fetch(name, parentMeta)
      .then(buildModule, Utils.forwardError);

    function buildModule() {
      return loader.asyncBuildModule(name);
    }
  };


  /**
   * This method fetches the module meta if it is not already loaded. Once the
   * the module meta is fetched, it is put through the transform pipeline. Once
   * the transformation is done, all dependencies are fetched.
   *
   * The purpose for this method is to setup the module meta and all its dependencies
   * so that the module meta can be converted to an instance of Module synchronously.
   *
   * Use this method if the intent is to preload dependencies without actually compiling
   * module metas to instances of Module.
   *
   * @param {string} name - The name of the module to fetch
   * @returns {Promise}
   */
  Loader.prototype.fetch = function(name, parentMeta) {
    var loader  = this,
        manager = this.manager;

    if (!name) {
      return Promise.reject(new TypeError("Must provide the name of the module to fetch"));
    }

    if (manager.hasModule(name)) {
      return Promise.resolve();
    }

    if (loader.isLoading(name)) {
      return loader.getLoading(name);
    }

    var loading = loader
      ._fetchModuleMeta(name, parentMeta)
      .then(moduleMetaReady, Utils.printError);

    return loader.setLoading(name, loading);

    function moduleMetaReady(moduleMeta) {
      loader.setLoaded(name, moduleMeta);
    }
  };


  /**
   * Converts a module meta object to a full Module instance.
   *
   * @param {string} name - The name of the module meta to convert to an instance of Module.
   *
   * @returns {Module} Module instance from the conversion of module meta
   */
  Loader.prototype.syncBuildModule = function(name) {
    var mod = this._compileModuleMeta(name);

    if (!mod) {
      if (this.isPending(name)) {
        throw new TypeError("Unable to synchronously build dynamic module '" + name + "'");
      }
      else {
        throw new TypeError("Unable to synchronously build module '" + name + "'");
      }
    }

    return this._linkModule(mod);
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
  Loader.prototype.asyncBuildModule = function(name) {
    var loader = this;
    var mod;

    if (this.isLoaded(name)) {
      mod = this._compileModuleMeta(name);
    }
    else if (this.manager.hasModule(name)) {
      return Promise.resolve(this.manager.getModule(name));
    }

    // If the module evaluation didn't register a new module, then we return whatever
    // was produced.
    if (!this.isPending(name)) {
      return Promise.resolve(this._linkModule(mod));
    }

    // Right here is where we handle dynamic registration of modules while are being loaded.
    // E.g. System.register to register a module that's being loaded
    return metaDependencies(loader.manager, loader.deleteModule(name))
      .then(buildDependencies, Utils.forwardError)
      .then(linkModuleMeta, Utils.forwardError);


    //
    // Helper methods
    //

    function buildDependencies(moduleMeta) {
      var pending = moduleMeta.deps.map(function buildDependency(moduleName) {
        return loader.asyncBuildModule(moduleName);
      });

      return Promise.all(pending)
        .then(function dependenciesBuilt() {
          return moduleMeta;
        });
    }

    function linkModuleMeta(moduleMeta) {
      return loader._linkModule(new Module(moduleMeta));
    }
  };


  /**
   * Interface to register a module meta that can be put compiled to a Module instance
   */
  Loader.prototype.register = function(name, deps, factory, type) {
    if (this.manager.hasModule(name) || this.hasModule(name)) {
      throw new TypeError("Module '" + name + "' is already loaded");
    }

    this.setPending(name, {
      name    : name,
      deps    : deps,
      factory : factory,
      type    : type
    });
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

    if (typeof(moduleMeta.source) !== "string") {
      throw Promise.reject(new TypeError("Must provide a source string property with the content to transform"));
    }

    moduleMeta.deps = moduleMeta.deps || [];
    return metaTransform(this.manager, moduleMeta);
  };


  /**
   * Calls the fetch provider to get a module meta object, and then puts it through
   * the module meta pipeline
   *
   * @param {string} name - Module name for which to build the module meta for
   * @param {Object} parentMeta - Is the module meta object that is requesting the fetch
   *   transaction, which is important when processing sub dependencies.
   *
   * @returns {Promise} When resolved, a module meta that has gone through the pipeline
   *   is returned.
   */
  Loader.prototype._fetchModuleMeta = function(name, parentMeta) {
    var loader = this;

    // This is where the call to fetch the module meta takes place. Once the
    // module meta is loaded, it is put through the transformation pipeline.
    return metaFetch(this.manager, name, parentMeta)
      .then(pipelineModuleMeta, Utils.forwardError);

    function pipelineModuleMeta(moduleMeta) {
      return loader._pipelineModuleMeta(moduleMeta);
    }
  };


  /**
   * Put a module meta object through the pipeline, which includes the transformation
   * and dependency loading stages.
   *
   * @param {object} moduleMeta - Module meta object to run through the pipeline.
   *
   * @returns {Promise} that when fulfilled, the processed module meta object is returned.
   */
  Loader.prototype._pipelineModuleMeta = function(moduleMeta) {
    if (Module.Meta.isCompiled(moduleMeta)) {
      return Promise.resolve(moduleMeta);
    }

    return this.pipeline
      .run(this.manager, moduleMeta)
      .then(pipelineFinished, Utils.forwardError);

    function pipelineFinished() {
      return moduleMeta;
    }
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

    if (this.isLoaded(name)) {
      moduleMeta = this.deleteModule(name);
    }
    else if (this.manager.isModuleCached(name)) {
      throw new TypeError("Module `" + name + "` is already loaded, so you can just call `manager.getModule(name)`");
    }
    else {
      throw new TypeError("Module `" + name + "` is not loaded yet. Make sure to call `load` or `fetch` prior to calling `linkModuleMeta`");
    }

    // Compile module meta to create a Module instance
    return metaCompilation(manager, moduleMeta);
  };


  /**
   * Finalizes a Module instance by pulling in all the dependencies and calling the module
   * factory method if available.  This is the very last stage of the Module building process
   *
   * @param {Module} mod - Module instance to link
   *
   * @returns {Module} Instance all linked
   */
  Loader.prototype._linkModule = function(mod) {
    if (!(mod instanceof(Module))) {
      throw new TypeError("Module `" + mod.name + "` is not an instance of Module");
    }

    ////
    // This is the sweet spot when synchronous build process and dynamic module registration meet.
    //
    // Module registration/import are async operations. Build process is sync.  So the challenge
    // is to make sure these two don't cross paths.  We solve this problem by making sure we
    // only process pending module meta objects in async module loading methods such as
    // `import`, because that method is asynchronous.  We want async operations to run early
    // and finish all they work.  And then ONLY run sync operations so that calls like `require`
    // can behave synchronously.
    ////
    if (this.isPending(mod.name)) {
      console.warn("Module '" + mod.name + "' is being dynamically registered while being loaded.", "You don't need to call 'System.register' when the module is already being loaded.");
    }

    // Run the Module instance through the module linker
    return moduleLinker(this.manager, mod);
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
    return this.context.hasModuleWithState(ModuleState.LOADING, name);
  };


  /**
   * Method to retrieve the module meta with the given name, if it is loading.
   *
   * @param {string} name - The name of the loading module meta to get.
   *
   * @returns {Promise}
   */
  Loader.prototype.getLoading = function(name) {
    return this.context.getModuleWithState(ModuleState.LOADING, name);
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
    return this.context.setModule(ModuleState.LOADING, name, item);
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
    return this.context.hasModuleWithState(ModuleState.PENDING, name);
  };


  /**
   * Method to get a module meta object to the pending state.
   *
   * @param {string} name - Name of the module meta to get
   *
   * @returns {Object} Module meta object
   */
  Loader.prototype.getPending = function(name) {
    return this.context.getModuleWithState(ModuleState.PENDING, name);
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
    return this.context.setModule(ModuleState.PENDING, name, item);
  };


  /**
   * Method to check if a module meta with the given name is already loaded.
   *
   * @param {string} name - The name of the module meta to check.
   *
   * @returns {Boolean}
   */
  Loader.prototype.isLoaded = function(name) {
    return this.context.hasModuleWithState(ModuleState.LOADED, name);
  };


  /**
   * Method to retrieve the module meta with the given name, if one exists.
   *
   * @param {string} name - The name of the loaded module meta to set
   *
   * @returns {Object} The loaded module meta
   */
  Loader.prototype.getLoaded = function(name) {
    return this.context.getModuleWithState(ModuleState.LOADED, name);
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
    return this.context.setModule(ModuleState.LOADED, name, item);
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
})();
