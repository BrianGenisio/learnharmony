var Promise = require("./promise");
var Utils   = require("./utils");
var Rule    = require("roolio");

var pluginId = 0;


/**
 * Plugin
 */
function Plugin(name, options) {
  options = options || {};
  this.name       = name || ("plugin-" + (pluginId++));
  this.settings   = options;
  this.services   = options.services || options.pipelines;
  this._matches   = {};
  this._delegates = {};
  this._handlers  = {};
}


/**
 * Configure plugin
 */
Plugin.prototype.configure = function(options, handlerVisitor) {
  var settings = Utils.merge({}, options);

  // Add matching rules
  for (var matchName in settings.match) {
    if (!settings.match.hasOwnProperty(matchName)) {
      continue;
    }

    this.addMatchingRules(matchName, settings.match[matchName]);
  }

  // Hook into the different services
  for (var serviceName in settings) {
    if (!settings.hasOwnProperty(serviceName) || serviceName === "match") {
      continue;
    }

    this.addHandlers(serviceName, settings[serviceName], handlerVisitor);
  }

  return this;
};


/**
 * Method for adding matching rules used for determining if a
 * module meta should be processed by the plugin or not.
 */
Plugin.prototype.addMatchingRules = function(matchName, matches) {
  var rules;
  if (matches && matches.length) {
    rules = this._matches[matchName] || (this._matches[matchName] = new Rule({name: matchName}));
    rules.addMatcher(matches);
  }

  return this;
};


/**
 * Adds handlers for the particular service.
 */
Plugin.prototype.addHandlers = function(serviceName, handlers, visitor) {
  if (!this.services.hasOwnProperty(serviceName)) {
    throw new TypeError("Unable to register plugin for '" + serviceName + "'. '" + serviceName + "' is not found");
  }

  // Make sure we have a good plugin's configuration settings for the service.
  this._handlers[serviceName] = configurePluginHandlers(this, handlers, visitor);

  // Register service delegate if one does not exist.  Delegates are the callbacks
  // registered with the service that when called, the plugins executes all the
  // plugin's handlers in a promise sequence.
  if (!this._delegates[serviceName]) {
    this._delegates[serviceName] = createServiceHandler(this, serviceName);
    registerServiceHandler(this, this.services[serviceName], this._delegates[serviceName]);
  }

  return this;
};


/**
 * Register service handler delegate
 */
function registerServiceHandler(plugin, service, handler) {
  service.use({
    name    : plugin.name,
    match   : plugin._matches,
    handler : handler
  });
}


/**
 * Creates service handler to process module meta objects
 */
function createServiceHandler(plugin, serviceName) {
  // The service handler iterates through all the plugin handlers
  // passing in the correspoding module meta to be processed.
  return function handlerDelegate(moduleMeta) {
    // This is a nasty little sucker with nested layers of promises...
    // Handlers themselves can return promises and get injected into
    // the promise sequence.
    function handlerIterator(prev, handlerConfig) {
      function pluginHandler() {
        return handlerConfig.handler.call(handlerConfig, moduleMeta, handlerConfig.options);
      }
      return prev.then(pluginHandler, Utils.reportError);
    }

    return plugin._handlers[serviceName].reduce(handlerIterator, Promise.resolve());
  };
}


/**
 * Function that goes through all the handlers and configures each one. This is
 * where handle things like if a handler is a string, then we assume it is the
 * name of a module that we need to load...
 */
function configurePluginHandlers(plugin, handlers, visitor) {
  if (!handlers) {
    throw new TypeError("Plugin must have 'handlers' defined");
  }

  if (!Utils.isArray(handlers)) {
    handlers = [handlers];
  }

  return handlers.map(function handlerIterator(handlerConfig) {
    var handlerName;

    if (!handlerConfig) {
      throw new TypeError("Plugin handler must be a string, a function, or an object with a handler that is a string or a function");
    }

    if (Utils.isFunction(handlerConfig) || Utils.isString(handlerConfig)) {
      handlerConfig = {
        handler: handlerConfig
      };
    }

    // Handle dynamic handler loading
    if (Utils.isString(handlerConfig.handler)) {
      handlerName = handlerConfig.handler;
      handlerConfig.deferred = handlerName;
      handlerConfig.handler = deferredHandler;
    }

    if (!Utils.isFunction(handlerConfig.handler)) {
      throw new TypeError("Plugin handler must be a function or a string");
    }

    function deferredHandler(moduleMeta) {
      if (handlerConfig.pending) {
        return;
      }

      // Set a pending flag so that we do not add this same deferred handler to
      // the same sequence, which causes a deadlock.
      handlerConfig.pending = handlerName;
      function handlerReady(newhandler) {
        delete handlerConfig.pending; // Cleanup the pending field.
        handlerConfig.handler = newhandler;
        return newhandler.call(handlerConfig, moduleMeta, handlerConfig.options);
      }

      return deferredPluginHandler(plugin, handlerName)
        .then(handlerReady, Utils.reportError);
    }

    // Once the plugin handler is configured, call the visitor callback if one is provided.
    if (visitor) {
      visitor(handlerConfig);
    }

    return handlerConfig;
  });
}


/**
 * Create a handler delegate that when call, it loads a module to be used
 * as the actualhandler used in a service.
 */
function deferredPluginHandler(plugin, handlerName) {
  if (!plugin.settings.import) {
    throw new TypeError("You must configure an import method in order to dynamically load plugin handlers");
  }

  return plugin.settings.import(handlerName);
}


/**
 * Checks if the handler can process the module meta object based on
 * the matching rules for path and name.
 */
function canExecute(matches, moduleMeta) {
  var ruleLength, allLength = 0;

  for (var match in matches) {
    if (!moduleMeta.hasOwnProperty(match) || !matches.hasOwnProperty(match)) {
      continue;
    }

    ruleLength = matches[match].getLength();
    allLength += ruleLength;

    if (ruleLength && matches[match].match(moduleMeta[match])) {
      return true;
    }
  }

  // If there was no matching rule, then we will return true.  That's because
  // if there weren't any rules put in place to restrict module processing,
  // then the assumption is that the module can be processed.
  return !allLength;
}


function createCanExecute(moduleMeta) {
  return function canExecuteDelegate(plugin) {
    return canExecute(plugin.match, moduleMeta);
  };
}


Plugin.canExecute       = canExecute;
Plugin.createCanExecute = createCanExecute;
module.exports = Plugin;
