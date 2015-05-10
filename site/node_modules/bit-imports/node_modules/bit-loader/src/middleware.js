var Promise = require("./promise");
var Utils   = require("./utils");
var logger  = require("./logger").factory("Middleware");


/**
 * @constructor For checking middleware provider instances
 */
function Provider() {
}


/**
 * Method that determines if the handler should be called and then calls
 * if need be.
 *
 * @returns {Promise} Promise returned from the call to the handler.
 */
Provider.prototype.execute = function(data) {
  if (Utils.isFunction(this.handler)) {
    return this.handler.apply(this, data);
  }
};


/**
 * Middleware provides a mechanism for registering `plugins` that can be
 * called in the order in which they are registered.  These middlewares can
 * be module names that can be loaded at runtime or can be functions.
 */
function Middleware(options) {
  this.settings  = options || {};
  this.providers = [];
  this.named     = {};
}


/**
 * Method to register middleware providers. Providers can be methods, a module name,
 * or an object.
 *
 * For example, the provider below is just a method that will get invoked when
 * running the entire sequence of providers. The provider is registered as an
 * anonymous provider.
 *
 * ``` javascript
 * middleware.use(function() {
 *   console.log("1");
 * });
 * ```
 *
 * But registering a provider as a name will cause the middleware engine to
 * dynamically load it at runtime, and can also be executed by name.
 *
 * ``` javascript
 * middleware.use(`concat`);
 * middleware.run(`concat`);
 * ```
 *
 * The alternative for registering named providers is to pass in a `Object` with a
 * `handler` method and a `name`.  The name is only required if you are interested in
 * more control for executing the provider.
 *
 * ``` javascript
 * middleware.use({
 *  name: "concat",
 *  handler: function() {
 *  }
 * });
 *
 * // Will only run `concat`
 * middleware.run(`concat`);
 *
 * // Will run all registered providers, including `concat`
 * middleware.runAll();
 * ```
 *
 * @param {Object | Array<Object>} providers - One or collection of providers to
 *   be registered in this middleware instance.
 *
 * @returns {Middleware} Returns instance of Middleware
 */
Middleware.prototype.use = function(providers) {
  if (!Utils.isArray(providers)) {
    providers = [providers];
  }

  var i, length, provider, options;
  for (i = 0, length = providers.length; i < length; i++) {
    options = providers[i];

    if (!options) {
      throw new TypeError("Middleware provider must not be empty");
    }

    if (this.hasProvider(options.name)) {
      Middleware.configureProvider(this, this.getProvider(options.name), options);
    }
    else {
      provider = Middleware.createProvider(this, options);
      this.providers.push(provider);

      if (Utils.isString(provider.name)) {
        this.named[provider.name] = provider;
      }
    }
  }

  return this;
};


/**
 * Gets the middleware provider by name.  It also handles when the middlware
 * handler does not exist.
 *
 * @returns {Provider}
 */
Middleware.prototype.getProvider = function(name) {
  if (!this.named.hasOwnProperty(name)) {
    throw new TypeError("Middleware provider '" + name + "' does not exist");
  }

  return this.named[name];
};


/**
 * Determines whether or not the provider with the specific name is already
 * registered.
 *
 * @param {string} name - Name of the provider.
 * @returns {boolean} Whether or not the named provider is already registered
 */
Middleware.prototype.hasProvider = function(name) {
  return this.named.hasOwnProperty(name);
};


/**
 * Creates an array of Providers from the array of names
 *
 * @param {string | Array.<string>} names - Name of collection of provider names
 *   to be returned in an array of providers.
 *
 * @returns {Array.<Provider>} Array of providers.
 */
Middleware.prototype.filterProviders = function(names) {
  if (Utils.isString(names)) {
    names = [names];
  }

  if (!Utils.isArray(names)) {
    throw new TypeError("List of handlers must be a string or an array of names");
  }

  var i, length;
  var providers = [];

  for (i = 0, length = names.length; i < length; i++) {
    if (this.hasProvider(names[i])) {
      providers.push(this.getProvider(names[i]));
    }
  }

  return providers;
};


/**
 * Method that runs `named` providers.  You can pass in a name of the provider
 * to be executed or an array of names.  If passing in an array, the providers
 * will be executed in the order in which they are in the array; regardless of
 * the order in which they were registered.
 *
 * @param {string | Array<string>} names - Name(s) of the providers to run
 *
 * @returns {Promise}
 */
Middleware.prototype.run = function(names, data, canExecuteProvider) {
  if (data && !Utils.isArray(data)) {
    data = [data];
  }

  var providers = this.filterProviders(names);
  return _runProviders(providers, data, canExecuteProvider);
};


/**
 * Method that runs the first found `named` provider.  You can pass in a name of
 * the provider to be executed or an array of names to chose from.
 *
 * @param {string | Array<string>} names - Name(s) of the providers to run
 *
 * @returns {Promise}
 */
Middleware.prototype.runFirst = function(names, data, canExecuteProvider) {
  if (data && !Utils.isArray(data)) {
    data = [data];
  }

  var providers = this.filterProviders(names).shift();
  return _runProviders(providers ? [providers] : [], data, canExecuteProvider);
};


/**
 * Method to run all registered providers in the order in which they were
 * registered.
 *
 * @returns {Promise}
 */
Middleware.prototype.runAll = function(data, canExecuteProvider) {
  if (data && !Utils.isArray(data)) {
    data = [data];
  }

  return _runProviders(this.providers, data, canExecuteProvider);
};


/**
 * @private
 *
 * Method to configure providers.
 */
Middleware.configureProvider = function(middleware, provider, options) {
  if (Utils.isFunction(provider.configure)) {
    provider.configure(options);
  }
  if (Utils.isFunction(options)) {
    provider.handler = options;
  }
  else if (Utils.isString(options)) {
    provider.name = options;

    if (!Utils.isFunction(provider.handler)) {
      provider.handler = Middleware.deferredHandler(middleware, provider);
    }
  }
  else if (Utils.isPlainObject(options)) {
    if (!Utils.isFunction(options.handler) && !Utils.isFunction(provider.handler)) {
      if (Utils.isString(options.name)) {
        options.handler = Middleware.deferredHandler(middleware, provider);
      }
      else {
        throw new TypeError("Middleware provider must have a handler method or a name");
      }
    }

    Utils.extend(provider, options);
  }

  return provider;
};


/**
 * @private
 *
 * Provider factory
 */
Middleware.createProvider = function(middleware, options) {
  var provider;

  if (Utils.isFunction(options) || Utils.isString(options) || Utils.isPlainObject(options)) {
    provider = Middleware.configureProvider(middleware, new Provider(), options);
  }

  return provider || options;
};


/**
 * @private
 *
 * Method that enables chaining in providers that have to be dynamically loaded.
 */
Middleware.deferredHandler = function(middleware, provider) {
  if (!middleware.settings.import) {
    throw new TypeError("You must configure an import method in order to dynamically load middleware providers");
  }

  function importProvider() {
    if (!provider.__deferred) {
      logger.log("import [start]", provider);
      provider.__deferred = middleware.settings
        .import(provider.name)
        .then(providerImported, Utils.reportError);
    }
    else {
      logger.log("import [pending]", provider);
    }

    return provider.__deferred;
  }

  function providerImported(result) {
    logger.log("import [end]", provider);
    delete provider.__deferred;
    Middleware.configureProvider(middleware, provider, result);
  }


  return function deferredHandlerDelegate() {
    var data = arguments;

    // Callback when provider is loaded
    function providerReady() {
      return provider.execute(data);
    }

    return importProvider().then(providerReady, Utils.reportError);
  };
};


/**
 * @private
 *
 * Method that runs a cancellable sequence of promises.
 *
 * When a provider is executed, sequence execution can be terminated by returning
 * false. You can also `throw` to teminate the execution.
 *
 * The only thing a provider can return is a promise, which is really useful
 * if the provider needs to do some work asynchronously.
 */
function _runProviders(providers, data, canExecuteProvider) {
  // Method that runs the sequence of providers
  function providerSequence(result, provider) {
    var cancelled = false;

    function providerSequenceRun(result) {
      if (result === false) {
        cancelled = true;
      }

      if (!cancelled) {
        if (!canExecuteProvider || (canExecuteProvider && canExecuteProvider(provider) !== false)) {
          return provider.execute(data);
        }
      }
    }

    function providerSequenceError(err) {
      cancelled = true;
      return Utils.reportError(err);
    }

    return result.then(providerSequenceRun, providerSequenceError);
  }

  return providers.reduce(providerSequence, Promise.resolve());
}


Middleware.Provider = Provider;
module.exports = Middleware;
