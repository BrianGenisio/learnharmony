var runEval = require("./evaluate");

function Compiler(loader) {
  this.loader = loader;
  this.logger = loader.Logger.factory("Bitimporter/Compiler");

  // Compiler interface
  this.compile = this.compile.bind(this);
}


/**
 * Method that executes a module meta object in order to generate a final Module product.
 * It does it by first evaluating the module meta source, then collecting any `AMD` define
 * calls, then figuring out what type of Module is created.
 *
 * @returns {Module}
 */
Compiler.prototype.compile = function(moduleMeta) {
  var loader = this.loader;
  this.logger.log(moduleMeta.name, moduleMeta);

  // Evaluation will execute the module meta source, which might call `define`.
  // When that happens, `getDefinitions` will get us the proper module definitions.
  var evaluated   = evaluate(this.loader, moduleMeta);
  var definitions = loader.providers.define.getDefinitions(moduleMeta.name);

  // Dynamic module deifnitions are handled right here... This happens when `define` is
  // usde for defining modules
  if (definitions) {
    setupFactory(loader, moduleMeta, definitions);
  }
  else {
    // If `define` was not called, the we will try to assign the result of the function
    // call to support IIFE, or exports.
    moduleMeta.configure({
      type: evaluated._result ? loader.Module.Type.IIFE : loader.Module.Type.CJS,
      code: evaluated._result || evaluated._module.exports
    });
  }
};


/**
 * Function that monkey patches the factory method for the module so that we can
 * call it with the correct dependencies whenever the module is being built.
 *
 * @private
 */
function setupFactory(loader, moduleMeta, definitions) {
  var factory = definitions.factory;

  if (typeof(factory) === "function") {
    definitions.factory = function factoryDelegate() {
      var result  = factory.apply(undefined, arguments);
      var _module = moduleMeta.builtins.module;

      if (result !== undefined) {
        return result;
      }
      else if (_module.hasOwnProperty("exports")) {
        return _module.exports;
      }
      else {
        return _module;
      }
    };
  }

  definitions.type = loader.Module.Type.AMD;
  moduleMeta.configure(definitions);
}


/**
 * Method that evaluates the module meta source
 *
 * @private
 */
function evaluate(loader, moduleMeta) {
  var source  = moduleMeta.source + getSourceUrl(moduleMeta); // We must add a sourceURL to be able to add breakpoints in Chrome.
  var _module = {exports: {}, id: moduleMeta.name, meta: moduleMeta};
  var result  = runEval(loader, loader.define, loader.require, _module, _module.exports, moduleMeta.directory, moduleMeta.path, source);

  // Setup support for AMD built-ins
  moduleMeta.builtins = {
    module: _module,
    exports: _module.exports,
    require: loader.require
  };

  return {
    _result: result,
    _module: _module
  };
}


/**
 * Builds a `# sourceURL` string from the URL.
 *
 * @private
 *
 * @param {Module.Meta} moduleMeta - Module meta object this function is processing
 * @returns {string} The proper source url to be inserted in the module source
 */
function getSourceUrl(moduleMeta) {
  var url = canUseSourceURL(moduleMeta) ? moduleMeta.path : moduleMeta.id;
  return "\n//# sourceURL=" + url;
}


/**
 * Verifies if a sourceUrl should be the full url of the module or just
 * the module name. This is to avoid having source maps and the source
 * url being added be the same url because browsers don't handle that
 * very well.
 *
 * @private
 *
 * @param {Module.Meta} moduleMeta - Module meta object this function is processing
 * @returns {boolean}
 */
function canUseSourceURL(moduleMeta) {
  if (!moduleMeta.source) {
    return false;
  }

  return (moduleMeta.source.indexOf("//# sourceMappingURL=") === -1) && (moduleMeta.source.indexOf("//# sourceURL=") === -1);
}


module.exports = Compiler;
