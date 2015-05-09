function Compiler(loader) {
  this.loader = loader;
  this.logger = loader.Logger.factory("Bitimporter/Compiler");

  // Compiler interface
  this.compile    = this.compile.bind(this);
  this.canCompile = this.canCompile.bind(this);
}


Compiler.prototype.canCompile = function(/*moduleMeta*/) {
  return true;
};


/**
 * Method that executes a module meta object in order to generate a final Module product.
 * It does it by first evaluating the module meta source, then collecting any `AMD` define
 * calls, then figuring out what type of Module is created.
 *
 * @returns {Module}
 */
Compiler.prototype.compile = function(moduleMeta, parentMeta) {
  var loader = this.loader;
  this.logger.log(moduleMeta.name, moduleMeta);

  // Evaluation will execute the module meta source, which might call `define`.
  // When that happens, `getDefinitions` will get us the proper module definitions.
  var evaluated   = evaluate.call(this, moduleMeta, parentMeta);
  var definitions = loader.providers.define.getDefinitions(moduleMeta.name);

  if (definitions) {
    definitions.type = loader.Module.Type.AMD;
    return new loader.Module(definitions);
  }

  // If `define` was not called, the we will try to assign the result of the function
  // call to support IIFE, or exports.
  moduleMeta.type = evaluated._result ? loader.Module.Type.IIFE : loader.Module.Type.CJS;
  moduleMeta.code = evaluated._result || evaluated._module.exports;
  return new loader.Module(moduleMeta);
};



/**
 * Method that evaluates the module meta source
 *
 * @private
 */
function evaluate(moduleMeta, parentMeta) {
  var loader  = this.loader;
  var url     = moduleMeta.url.href;
  var source  = moduleMeta.source + getSourceUrl(url);
  var _module = {exports: {}, id: moduleMeta.name, url: url, meta: moduleMeta, parent: parentMeta};

  /* jshint -W061, -W054 */
  var execute = new Function("System", "define", "require", "module", "exports", "__dirname", "__filename", source);
  /* jshint +W061, +W054 */

  var result = execute(loader, loader.define, loader.require, _module, _module.exports, moduleMeta.directory, moduleMeta.path);

  return {
    _result: result,
    _module: _module
  };
}


/*
 * Builds a `# sourceURL` string from the URL.
 *
 * @private
 */
function getSourceUrl(url) {
  return "\n//# sourceURL=" + url;
}


module.exports = Compiler;
