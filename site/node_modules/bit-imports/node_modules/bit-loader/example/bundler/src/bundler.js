var browserPack = require("browser-pack");
var pstream     = require("./pstream");


/**
 * Convenience factory for specifying the instance of bit loader to bundle up
 */
function bundlerFactory(loader, options) {
  return function bundlerDelegate(modules) {
    return bundler(loader, options, modules);
  };
}


/**
 * Bundles up incoming modules. This will process all dependencies and will create
 * a bundle using browser-pack.
 *
 * @returns {Promise} When resolve, the full bundle buffer is returned
 */
function bundler(loader, options, modules) {
  var stack    = modules.slice(0);
  var mods     = [];
  var finished = {};

  function processModule(mod) {
    if (finished.hasOwnProperty(mod.id)) {
      return;
    }

    var meta = mod.meta;

    // browser pack chunk
    var browserpack = {
      id     : meta.id,
      source : meta.source,
      deps   : {}
    };

    // Gather up all dependencies
    var i, length, dep;
    for (i = 0, length = mod.deps.length; i < length; i++) {
      dep = loader.getModule(mod.deps[i]);
      stack.push(dep);
      browserpack.deps[dep.id] = dep.id;
    }

    finished[meta.id] = browserpack;
    mods.unshift(browserpack);
  }

  // Process all modules
  while (stack.length) {
    processModule(stack.pop());
  }

  var stream  = browserPack(options);
  var promise = pstream(stream);
  stream.end(JSON.stringify(mods));
  return promise;
}


module.exports = bundlerFactory;
