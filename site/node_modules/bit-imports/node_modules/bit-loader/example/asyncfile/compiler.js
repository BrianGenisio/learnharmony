/**
 * Module compiler that convert source to runnable code.
 */
function compileModule(moduleMeta) {
  moduleMeta.configure({
    code: evaluate(moduleMeta)
  });
}


/**
 * Helper method that evaluates source to generate runnable code
 */
function evaluate(moduleMeta) {
  var _exports = {};
  var _module = {exports: _exports};
  /* jshint -W054 */
  (new Function("module", "exports", moduleMeta.source))(_module, _exports);
  /* jshint +W054 */
  return typeof(_module.exports) === "undefined" ? _module : _module.exports;
}


module.exports = compileModule;
