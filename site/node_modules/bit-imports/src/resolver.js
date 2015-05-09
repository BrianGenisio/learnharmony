var ResolverProvider = require('amd-resolver');


function Resolver(settings) {
  settings = settings || {};
  settings.baseUrl = getBaseUrl(settings.baseUrl);
  this._resolver = new ResolverProvider(settings);
}


Resolver.prototype.resolve = function(moduleMeta, moduleParent) {
  var meta       = this._resolver.resolve(moduleMeta.name, getWorkingDirectory(moduleParent));
  var pathInfo   = ResolverProvider.File.parseParts(meta.url.href);
  meta.directory = pathInfo.directory;
  meta.path      = pathInfo.path;
  return meta;
};


/*
 * This will adjust the baseUrl in the settings so that requests get the absolute
 * url so that browsers can better handle `# sourceURL`.  In chrome for example,
 * the files are added to the developer tools' source tree, which let's you put
 * break points directly from the developer tools.
 */
function getBaseUrl(url) {
  var base = typeof(window) !== 'undefined' ? window.location.href : '';
  return ResolverProvider.URL.parser.resolve(base, url || "");
}


/*
 * Gets the url form the module data if it exists.
 */
function getWorkingDirectory(moduleMeta) {
  return (moduleMeta && moduleMeta.path) || '';
}


module.exports = Resolver;
