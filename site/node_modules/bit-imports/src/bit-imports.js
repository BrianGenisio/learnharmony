var Fetcher    = require('./fetcher');
var Compiler   = require('./compiler');
var Define     = require('./define');
var Require    = require('./require');
var Resolver   = require('./resolver');
var dependency = require('deps-bits');
var Bitloader  = require('bit-loader');


/**
 * Default options for Bitimports instances
 *
 * @private
 * @memberof Bitimports
 *
 * @property {string} baseUrl - Url modules are relative to
 * @property {Object} paths - Map of module names to module locations
 * @property {Object} shim - Definition of modules that are loaded into the global space that need to be used a modules
 * @property {Array.<string>} deps - List of dependencies to be loaded before the first module is loaded.
 * @property {Array.<Object>} packages - List of package definition to map module names to directory structures
 * @property {Array.<string|Function|Object>} transforms - List of transformations that process module source files.
 */
var defaults = {
  baseUrl    : ".",
  paths      : {},
  shim       : {},
  deps       : [],
  packages   : [],
  transforms : []
};


/**
 * Bitimports extends Bitloader's functionality to provide support for AMD and
 * CJS. It implements a fetch provider to load files from storage. It also adds
 * the `define` and `require` methods to facilitte defining and loading modules
 *
 * @class
 * @private
 * @lends Bitloader.prototype
 *
 * @param {Object} options - Configuration settings to create Bitimports
 *  instance.
 *  Please take a look over at [amd resolver]{@link https://github.com/MiguelCastillo/amd-resolver}
 *  for details on the options.
 * @param {string} options.baseUrl - Is the root URL that all modules are
 *  relative to.
 * @param {Object} options.paths - Is a map of module names to module locations
 *  This really useful for setting up module names that are more legible and
 *  easier to maintain.
 * @param {Array.<(string|Function|Object)>} options.transforms[] - Collection of
 *  transforms to be applied to module meta sources.
 * @param {string} options.transforms[] - Transform to be loaded as a named
 *  module.
 * @param {Function} options.transforms[] - Anonymous transformation that
 *  transforms module meta source.
 * @param {Object} options.transforms[] - More specific transform configuration
 *  where either a name or handler function must be provided.
 * @param {string} options.transforms[].name - If item.handler isn't present,
 *  then Bitimports will load the transform as a module. Otherwise, it is
 *  pretty much only used for logging purposes.
 * @param {Function} options.transforms[].handler - If item.name isn't present,
 *  then the handler is considered an anonymous transform, otherwise it is
 *  considered a named transformed. Named transforms are very useful when
 *  debugging because transforms' names are logged
 */
function Bitimports(options) {
  var settings = Bitloader.Utils.merge({}, defaults, options);
  var resolver = new Resolver(settings);
  var fetcher  = new Fetcher(this, settings);
  var compiler = new Compiler(this, settings);

  settings.resolve = settings.resolve || resolver.resolve.bind(resolver);
  settings.fetch   = settings.fetch   || fetcher.fetch.bind(fetcher);
  settings.compile = settings.compile || compiler.compile.bind(compiler);

  // Setup bit-loader
  Bitloader.call(this, settings);

  // Register dependency processor
  this.plugin("js", {
    "dependency": dependency
  });

  // Make sure we don't process these AMD built-ins.
  this.ignore({
    name: "*",
    match: ["module", "exports", "require"]
  });

  var require = new Require(this);
  var define  = new Define();
  this.providers.require = require;
  this.providers.define  = define;

  this.require = require.require.bind(require);
  this.define  = define.define.bind(define);
  this.define.amd = {};
}


// Setup prototypal inheritance.
Bitimports.prototype = Object.create(Bitloader.prototype);
Bitimports.prototype.constructor = Bitimports;

// Add these contructs to the prototype so that bit import instances can have
// access to them.
Bitimports.prototype.Logger = Bitloader.Logger;
Bitimports.prototype.Module = Bitloader.Module;
Bitimports.prototype.Rule   = Bitloader.Rule;
Bitimports.prototype.Utils  = Bitloader.Utils;


/**
 * Bitimports factory
 *
 * @returns {Bitimports} Instance of Bitimports
 */
Bitimports.prototype.create = function(options) {
  return new Bitimports(options);
};


/**
 * Method to get modules.
 *
 * @param {string | Array.<string>} names - module name(s) to be loaded. When
 *  array is provided, the ready callback is always called to get the
 *  resulting modules.
 * @param {Function} ready - Callback function, which is called when the
 *  module(s) are loaded and ready for the application to consume.
 * @param {Object} options - Configuration settings specific to the
 *  [require]{@link Bitimports#require} call. For example, you can specify a
 *  `modules` map to tell Bitimports to use those modules before loading
 *  them from storage or cache.
 *  This is particularly useful for unit tests where dependency injection of
 *  mocked modules is needed.
 *
 * @returns {Promise|Module} When `require` is called with a single string and
 *  the module has already been loaded, then the actual module is returned.
 *  This is to follow `CJS` module format. If more than one module is
 *  `require`d, then a Promise is returned that when resolved, all the
 *  `require`d modules are passed in.
 */
Bitimports.prototype.require = function(){};


/**
 * Method to define a Module using AMD format, which can be dynamically
 * imported.
 *
 * @param {string} [name] - is the name of the module to define. If no name
 *  is present, then the last anonymous `define` is coerced to be the named
 *  module definition. An anonymous module is one with no name.
 * @param {Array.<string>} [dependencies] - list of module names to be loaded
 *  before the module definition is processed and executed (evaluated).
 * @param {*} factory - When factory is a function, it is called when the
 *  module is executed (evaluated) to define the module code. Whatever is
 *  returned from calling factory becomes the actual module code that's
 *  returned when the module is imported.
 *  When dependencies are defined, those are passed to factory as arguments.
 *  If factory is not a function, then that is the actual module code that is
 *  returned when the module is imported.
 *
 * @returns {Promise} That when resolved, it returns all the imported modules
 *  defined as dependencies.
 */
Bitimports.prototype.define = function(){};


/**
 * Method to configure an instance of Bitimports.
 *
 * config applies the configuration settings to `this` instance of Bitimports.
 * It will also create and return a new instance of Bitimports with the
 * configuration settings passed in. The config method is generally your
 * primary way of configuring and creating instances of Bitimports.
 *
 * @param {Object} [options] - Configuration settings used for creating the
 *  instance of Bitimports.
 *
 * @returns {Bitimports} Instance of Bitimports
 */
Bitimports.prototype.config = function(options) {
  Bitloader.Utils.merge(this.settings, options);
  return this.create(options);
};


/**
 * Convenience method to run the input string through the transformation
 * pipeline
 *
 * @param {string} source - Source string to be processed by the transformation
 *  pipeline.
 *
 * @returns {Promise} That when resolved, the processed text is returned.
 */
Bitimports.prototype.transform = function(source) {
  return this.providers.loader
    .transform({source: source})
    .then(function(moduleMeta) {
      return moduleMeta.source;
    }, Bitloader.Utils.reportError);
};


/**
 * `bitimports` is the default Bitimports instance available. All you need to
 * do if configure it with the [config]{@link Bitimports#config} method to
 * define how your application is structured. The goal of the configuration
 * step is to help you make your code simple and readable when importing and
 * exporting modules.
 *
 * When the bit-imports module is loaded via script tag, which is the more
 * common use case in the browser, `bitimports` is automatically added to the
 * global object.  But since bit-imports is a [UMD]{@link https://github.com/umdjs/umd}
 * module, feel free to load it as an [AMD]{@link https://github.com/amdjs/amdjs-api/wiki/AMD}
 * or [CJS]{@link http://wiki.commonjs.org/wiki/Modules/1.1.1} module.
 *
 * `bitimports` exposes methods such as [require]{@link Bitimports#require},
 * [define]{@link Bitimports#define}, [import]{@link Bitimports#import}, and
 * [register]{@link Bitimports#register} to provide a comprehensive system for
 * loading modules synchronously and asynchronously in `AMD` and `CJS` module
 * formats.
 *
 * @global
 * @name bitimports
 * @type Bitimports
 * @see {@link Bitimports}
 */
module.exports = new Bitimports();
