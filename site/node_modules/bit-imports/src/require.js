/**
 * @class
 *
 * Interface for `require` functionality
 */
function Require(loader) {
  this.loader  = loader;
  this.context = loader.context;
  this.logger  = loader.Logger.factory("Bitimporter/require");
}


/**
 * Method that imports a module.
 *
 * @param {string|string[]} name - Name or collection of module names to be loaded
 * @param {Function} [ready] - Function called when module(s) are loaded
 * @param {Object} [options] - Options used by the import interface.
 *
 * @returns {Promise|Module}
 */
Require.prototype.require = function(name, ready, options) {
  var loader = this.loader;
  this.logger.log(name, loader.context._id);

  if (loader.hasModule(name)) {
    return loader.getModuleCode(name);
  }
  else {
    return loader.import(name, options).done(ready || loader.Utils.noop);
  }
};

module.exports = Require;
