(function () {
  "use strict";

  var Promise     = require('promise'),
      Logger      = require('logger'),
      Utils       = require('./utils'),
      Fetcher     = require('./interfaces/fetcher'),
      Compiler    = require('./interfaces/compiler'),
      Resolver    = require('./interfaces/resolver'),
      Import      = require('./import'),
      Loader      = require('./loader'),
      Module      = require('./module'),
      Plugin      = require('./plugin'),
      Registry    = require('./registry'),
      RuleMatcher = require('./rule-matcher'),
      Middleware  = require('./middleware');

  var getRegistryId = Registry.idGenerator('bitloader');

  var ModuleState = {
    LOADED: "loaded"
  };


  /**
   * @class
   *
   * Facade for relevant interfaces to register and import modules
   */
  function Bitloader(options, factories) {
    options   = options   || {};
    factories = factories || {};

    this.settings = options;
    this.context  = Registry.getById(getRegistryId());

    this.plugins = {};

    this.rules = {
      ignore: new RuleMatcher()
    };

    this.pipelines = {
      transform  : new Middleware(this),
      dependency : new Middleware(this)
    };

    // Override any of these factories if you need specialized implementation
    this.providers = {
      resolver : factories.resolver ? factories.resolver(this) : new Bitloader.Resolver(this),
      fetcher  : factories.fetcher  ? factories.fetcher(this)  : new Bitloader.Fetcher(this),
      loader   : factories.loader   ? factories.loader(this)   : new Bitloader.Loader(this),
      importer : factories.import   ? factories.import(this)   : new Bitloader.Import(this),
      compiler : factories.compiler ? factories.compiler(this) : new Bitloader.Compiler(this)
    };

    // Public Interface
    var providers = this.providers;
    this.resolve  = providers.resolver.resolve.bind(providers.resolver);
    this.fetch    = providers.fetcher.fetch.bind(providers.fetcher);
    this.load     = providers.loader.load.bind(providers.loader);
    this.register = providers.loader.register.bind(providers.loader);
    this.import   = providers.importer.import.bind(providers.importer);
    this.compile  = providers.compiler.compile.bind(providers.compiler);

    // Register pipeline options.
    for (var pipeline in options) {
      if (options.hasOwnProperty(pipeline) && this.pipelines.hasOwnProperty(pipeline)) {
        this.pipelines[pipeline].use(options[pipeline]);
      }
    }
  }


  /**
   * Method to read files from storage. This is to be implemented by the code
   * making use of Bitloader.
   *
   * @param {string} name - Name of the module whose file content needs to be
   *  fetched.
   * @param {object} parentMeta - Parent module meta object fetching a
   *  dependency.
   *
   * @returns {Promise} Promise that when resolved, a module meta object
   *  with a "source" property is returned. The "source" property is where
   *  the content of the file is stored.
   */
  Bitloader.prototype.fetch = function(){};


  /**
   * Method for asynchronously loading modules.
   *
   * @returns {Pormise} That when resolved, it returns the full instance of the
   *  module loaded
   */
  Bitloader.prototype.load = function(){};


  /**
   * Method to asynchronously load modules
   *
   * @function
   *
   * @param {string|Array.<string>} names - Module or list of modules names to
   *  load. These names map back to the paths settings Bitloader was created
   *  with.
   *
   * @returns {Promise} That when resolved, all the imported modules are passed
   *  back as arguments.
   */
  Bitloader.prototype.import = function(){};


  /**
   * Method to define a module to be asynchronously loaded via the
   * [import]{@link Bitloader#import} method
   *
   * @param {string} name - Name of the module to register
   * @param {Array.<string>} deps - Collection of dependencies to be loaded and
   *  passed into the factory callback method.
   * @param {Function} factory - Function to be called in order to instantiate
   *  (realize) the module
   */
  Bitloader.prototype.register = function(){};


  /**
   * Clears the context, which means that all cached modules and other pertinent data
   * will be deleted.
   */
  Bitloader.prototype.clear = function() {
    this.context.clear();
  };


  /**
   * Checks if the module instance is in the module registry
   */
  Bitloader.prototype.hasModule = function(name) {
    return this.context.hasModule(name) || this.providers.loader.isLoaded(name);
  };


  /**
   * Returns the module instance if one exists.  If the module instance isn't in the
   * module registry, then a TypeError exception is thrown
   */
  Bitloader.prototype.getModule = function(name) {
    if (!this.hasModule(name)) {
      throw new TypeError("Module `" + name + "` has not yet been loaded");
    }

    if (!this.context.hasModule(name)) {
      return this.context.setModule(ModuleState.LOADED, name, this.providers.loader.syncBuild(name));
    }

    return this.context.getModule(name);
  };


  /**
   * Add a module instance to the module registry.  And if the module already exists in
   * the module registry, then a TypeError exception is thrown.
   *
   * @param {Module} mod - Module instance to add to the module registry
   *
   * @returns {Module} Module instance added to the registry
   */
  Bitloader.prototype.setModule = function(mod) {
    var name = mod.name;

    if (!(mod instanceof(Module))) {
      throw new TypeError("Module `" + name + "` is not an instance of Module");
    }

    if (!name || typeof(name) !== 'string') {
      throw new TypeError("Module must have a name");
    }

    if (this.context.hasModule(name)) {
      throw new TypeError("Module instance `" + name + "` already exists");
    }

    return this.context.setModule(ModuleState.LOADED, name, mod);
  };


  /**
   * Interface to delete a module from the registry.
   *
   * @param {string} name - Name of the module to delete
   *
   * @returns {Module} Deleted module
   */
  Bitloader.prototype.deleteModule = function(name) {
    if (!this.context.hasModule(name)) {
      throw new TypeError("Module instance `" + name + "` does not exists");
    }

    return this.context.deleteModule(name);
  };


  /**
   * Returns the module code from the module registry. If the module code has not
   * yet been fully compiled, then we defer to the loader to build the module and
   * return the code.
   *
   * @param {string} name - The name of the module code to get from the module registry
   *
   * @return {object} The module code.
   */
  Bitloader.prototype.getModuleCode = function(name) {
    if (!this.hasModule(name)) {
      throw new TypeError("Module `" + name + "` has not yet been loaded");
    }

    return this.getModule(name).code;
  };


  /**
   * Sets module evaluated code directly in the module registry.
   *
   * @param {string} name - The name of the module, which is used by other modules
   *  that need it as a dependency.
   * @param {object} code - The evaluated code to be set
   *
   * @returns {object} The evaluated code.
   */
  Bitloader.prototype.setModuleCode = function(name, code) {
    if (this.hasModule(name)) {
      throw new TypeError("Module code for `" + name + "` already exists");
    }

    var mod = new Module({
      name: name,
      code: code
    });

    return this.setModule(mod).code;
  };


  /**
   * Checks is the module has been fully finalized, which is when the module instance
   * get stored in the module registry
   */
  Bitloader.prototype.isModuleCached = function(name) {
    return this.context.hasModule(name);
  };


  /**
   * Add ignore rules for configuring what the different pipelines shoud not process.
   *
   * @param {Object} rule - Rule configuration
   * @returns {Bitloader} Bitloader instance
   */
  Bitloader.prototype.ignore = function(rule) {
    if (!rule) {
      throw new TypeError("Must provide a rule configuration");
    }

    var i, length, ruleNames;
    if (!rule.name) {
      ruleNames = ["transform", "dependency"];
    }
    else {
      ruleNames = Utils.isArray(rule.name) ? rule.name : [rule.name];
    }

    for (i = 0, length = ruleNames.length; i < length; i++) {
      this.rules.ignore.add({
        name: ruleNames[i],
        match: rule.match
      });
    }

    return this;
  };


  /**
   * Registers plugins into the pipeline.
   *
   * @param {string} name - Name of the plugin
   * @param {object} options - Object whose keys are the name of the particular
   *  pipeline they intend to register with. For example, if the plugin is to
   *  register a `transform` and a `dependency` pipeline handler, then the
   *  plugin object will have entries with those names. E.g.
   *
   *  ``` javascript
   *  var pluginDefinition = {
   *    "transform": function(meta) {
   *      console.log(meta);
   *    },
   *    "dependency": function(meta) {
   *      console.log(meta);
   *    }
   *  };
   *
   *  bitlaoder.plugin(plugin);
   *  ```
   */
  Bitloader.prototype.plugin = function(name, options) {
    if (Utils.isPlainObject(name)) {
      options = name;
      name = null;
    }

    var plugin;

    // If plugin exists, then we get it so that we can update it with the new settings.
    // Otherwise we create a new plugin and configure it with the incoming settings.
    if (this.plugins.hasOwnProperty(name)) {
      plugin = this.plugins[name];
    }
    else {
      plugin = new Plugin(name, this);
      this.plugins[plugin.name] = plugin;
    }

    return plugin.configure(options);
  };


  /**
   * Method to check if a plugin already exists.
   */
  Bitloader.prototype.hasPlugin = function(name) {
    return this.plugins.hasOwnProperty(name);
  };


  /**
   * Method to get a plugin that has already been loaded.
   */
  Bitloader.prototype.getPlugin = function(name) {
    if (this.plugins.hasOwnProperty(name)) {
      throw new TypeError("Plugin '" + name + "' not found");
    }

    return this.plugins[name];
  };


  Bitloader.prototype.Promise    = Promise;
  Bitloader.prototype.Module     = Module;
  Bitloader.prototype.Utils      = Utils;
  Bitloader.prototype.Logger     = Logger;
  Bitloader.prototype.Middleware = Middleware;

  // Expose constructors and utilities
  Bitloader.Promise     = Promise;
  Bitloader.Utils       = Utils;
  Bitloader.Registry    = Registry;
  Bitloader.Loader      = Loader;
  Bitloader.Import      = Import;
  Bitloader.Module      = Module;
  Bitloader.Plugin      = Plugin;
  Bitloader.Resolver    = Resolver;
  Bitloader.Fetcher     = Fetcher;
  Bitloader.Compiler    = Compiler;
  Bitloader.Middleware  = Middleware;
  Bitloader.RuleMatcher = RuleMatcher;
  Bitloader.Logger      = Logger;
  module.exports        = Bitloader;
})();
