// Evaluate in this anonymous method to keep the immediate closure air tight
// and not allow variables to be leaked to the global object.
/* jshint unused: false, evil: true */
module.exports = function(System, define, require, module, exports, __dirname, __filename) {
  // Really wish Chrome didn't have a bug where executing a function instance causes the stack
  // to be all crazy when debugging it...  So, we are using `eval` as a last resort.
  //
  //var execute = new Function("System", "define", "require", "module", "exports", "__dirname", "__filename", arguments[7]);
  //return execute(System, define, require, module, exports, __dirname, __filename);
  //eval('(new Function("System", "define", "require", "module", "exports", "__dirname", "__filename", source))(System, define, require, module, exports, __dirname, __filename)');
  eval(arguments[7]);
};
