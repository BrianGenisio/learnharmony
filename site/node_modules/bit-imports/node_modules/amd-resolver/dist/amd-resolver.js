(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.amdresolver = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

},{}],2:[function(require,module,exports){
var Url = require('./url');

function File(fileUrl, baseUrl) {
  this.url = new Url(fileUrl, baseUrl);
}

/**
 * Build and file object with the important pieces
 */
File.parseParts = function (fileString) {
  var name;
  var directory = fileString.replace(/([^/]+)$/gmi, function(match) {name = match;return "";});

  return {
    name: name || "",
    directory: directory,
    path: fileString
  };
};

/**
 * Method to add an extension if one does not exist in the fileString.  It does NOT replace
 * the file extension if one already exists in `fileString`.
 *
 * @param {string} fileString - File string to add the extension to if one does not exist
 * @param {string} extension - Extension to add if one does not exist in `fileString`. The
 *   value is the extension without the `.`. E.g. `js`, `html`.  Not `.js`, `.html`.
 * @returns {string} New fileString with the new extension if one did not exist
 */
File.addExtension = function(fileString, extension) {
  var fileName  = File.parseParts(fileString),
      fileParts = fileName.name.split(".");

  if (fileParts.length === 1 && extension) {
    fileParts.push(extension);
  }

  return fileName.directory + fileParts.join(".");
};

/**
 * Method to replace an extension, if one does not exist in the file string, it will be added.
 *
 * @param {string} fileString - File string to add the extension to if one does not exist
 * @param {string} extension - Extension to be either added to `fileString` or to replace the extension in `fileString`. The
 *   value is the extension without the `.`. E.g. `js`, `html`.  Not `.js`, `.html`.
 * @returns {string} fileString with the new extension
 */
File.replaceExtension = function(fileString, extension) {
  var regex = /([^.\/\\]+\.)[^.]+$/;
  if (fileString.match(regex)) {
    return fileString.replace(regex, "$1" + extension);
  }
  else {
    return fileString + "." + extension;
  }
};

module.exports = File;

},{"./url":4}],3:[function(require,module,exports){
var File = require('./file');
var Url  = require('./url');

/**
 * @constructor
 * Provides a way to build a module meta object from a module name.  The resolution
 * relies on configuration settings, which are compatible with requirejs. The created
 * module meta objects contain information such as a url that can be used for downloading
 * the corresponding file from a remote sever.
 */
function Resolver(options) {
  this.settings = options || {};
  var baseUrl = this.settings.baseUrl || (this.settings.baseUrl = ".");

  // Make sure that if a baseUrl is provided, it ends in a slash.  This is to ensure
  // proper creation of URLs.
  if (baseUrl && baseUrl[baseUrl.length - 1] !== '/') {
    this.settings.baseUrl = baseUrl + '/';
  }
}

/**
 * Creates a module meta from a module name/id.
 *
 * @param {string} name - Module name/id
 * @param {string} baseUrl - base url to be used when the `name` starts with `./`, `../`, or a protocol.
 *   Otherwise the configured baseUrl is used.
 *
 * @returns {{name: string, file: File, urlArgs: string, shim: object}}
 */
Resolver.prototype.resolve = function(name, baseUrl) {
  var i, length, file, pkg, pkgParts, pkgName, pkgTarget, shim;
  var settings = this.settings,
      urlArgs  = settings.urlArgs,
      shims    = settings.shim || {},
      packages = settings.packages || [],
      paths    = settings.paths || {},
      fileName = paths[name],
      plugins  = name.split("!");

  // The last item is the actual module name.
  name      = plugins.pop();
  pkgParts  = name.replace(/[\/\\]+/g, "/").split("/");
  pkgName   = pkgParts.shift();
  pkgTarget = pkgParts.join("/");

  // Go through the packages and figure if the module is actually configured as such.
  for (i = 0, length = packages.length; i < length; i++) {
    pkg = packages[i];

    if (pkg === pkgName) {
      fileName = pkgName + "/" + "main";
      break;
    }
    else if (pkg.name === pkgName) {
      fileName = pkg.location ? (pkg.location + "/") : "";
      fileName += pkgName + "/" + (pkgTarget || (pkg.main || "main"));
      break;
    }
  }

  if (shims.hasOwnProperty(name)) {
    shim = {
      name: shims[name].exports || shims[name].name || name,
      deps: shims[name].imports || shims[name].deps || []
    };
  }

  if (!fileName) {
     fileName = name;
  }

  // Let's assume .js extension for everything that is not defined with plugins
  if (plugins.length === 0 && /\.js$/.test(fileName) === false) {
    fileName += ".js";
  }

  baseUrl = Resolver.useBase(fileName) && baseUrl ? baseUrl : settings.baseUrl;
  file    = new File(urlArgs ? fileName + "?" + urlArgs : fileName, baseUrl);

  return {
    name: name,
    file: file, // Deprecated in favor of `url`
    url: file.url,
    shim: shim,
    plugins: plugins
  };
};


/**
 * Checks and returns true if name starts with `./`, `../`, or a protocol.  Otherwise returns false;
 */
Resolver.useBase = function(name) {
  return (name[0] === '.' && (name[1] === '/' || (name[1] === '.' && name[2] === '/'))) || Resolver.hasProtocol(name);
};


/**
 * Quick check to determine if the name has a known protocol. Currently we only support http(s) and file.
 */
Resolver.hasProtocol = function(name) {
  return /^(?:(https?|file)(:\/\/\/?))/g.test(name);
};


Resolver.File  = File;
Resolver.Url   = Url;
module.exports = Resolver;

},{"./file":2,"./url":4}],4:[function(require,module,exports){
var path = require('path');

/**
 * Url factory that creates URL object as defined here https://developer.mozilla.org/en-US/docs/Web/API/URL
 *
 * @param {urlString} string - URL string to build a URL object from
 * @param {baseString} string - URL string to use as a base for building the URL object.
 *
 * @returns {object} URL object
 */
function Url(urlString, baseString) {
  return Url.parser.join(baseString || "", urlString);
}


/**
 * Parses out a url, with an optional base url, and returns the fully processed href.
 *
 * @param {string} urlString - URL to be processed
 * @param {string} baseString - Base URL
 *
 * @returns {string} full href
 */
function resolve(baseString, urlString) {
  return Url.parser.join(baseString, urlString).href;
}


/**
 * Parses out a url string with an optional base url, and returns the fully resolved URL object.
 *
 * @param {string} urlString - URL to be processed
 * @param {string} baseString - Base URL
 *
 * @returns {object} URL object
 */
function join(baseString, urlString) {
  var base     = parse(baseString);
  var url      = parse(urlString);
  var pathname = "";

  if (path.isAbsolute(url.pathname)) {
    pathname = url.pathname;
  }
  else if (base.pathname || url.pathname) {
    pathname = path.join(directory(base.pathname), url.pathname);
  }

  if (!url.hostname && base.hostname) {
    url = base;
  }

  url.pathname = pathname;
  url.href     = parse.href(url);
  return url;
}


/**
 * Parses out a string and creates a URL object as defined
 * here https://developer.mozilla.org/en-US/docs/Web/API/URL
 *
 * Parses out the username and password from a URL as defined here.
 * https://developer.mozilla.org/en-US/docs/Web/API/URLUtils/username
 * https://developer.mozilla.org/en-US/docs/Web/API/URLUtils/password
 *
 * @param {string} urlString - URL string to be parsed to create a URL object
 * @returns {object} URL object
 */
function parse(urlString) {
  var urlParts = /^((https?:)(\/\/\/?)(?:([\w]+)(?::([\w]*))?@)?([\d\w\.-]+)(?::(\d+))?)?([\/\\\w\.()-]*)?(?:([?][^#]*)?(#.*)?)*/gmi.exec(urlString);
  urlParts.shift();

  // Make sure we sanitize the slashes and dotted paths
  if (urlParts[5]) {
    urlParts[5] = path.normalize(urlParts[5]);
  }

  var url = {
    origin    : urlParts[0] || "",
    protocol  : urlParts[1] || "",
    delimeter : urlParts[2] || "",
    username  : urlParts[3] || "",
    password  : urlParts[4] || "",
    hostname  : urlParts[5] || "",
    port      : urlParts[6] || "",
    pathname  : urlParts[7] || "",
    search    : urlParts[8] || "",
    hash      : urlParts[9] || ""
  };

  url.pathname = parse.pathname(url);
  url.host     = parse.host(url);
  url.href     = parse.href(url);
  return url;
}


/**
 * Parses out the pathname based on whether or not a hostname exists. If a
 * hostname exists then there must always be a path; "/" by default. Otherwise
 * pathname can be empty.
 *
 * @param {object} url - URL object
 * @returns {string} pathname
 */
parse.pathname = function(url) {
  return url.hostname ? (url.pathname || "/") : url.pathname;
};


/**
 * Builds a host string.  The host string is defined as the hostname, and if a port
 * is specified, then a ":" and the port number.  Otherwise just the hostname.
 *
 * @param {object} url - URL object
 * @returns {string} Host string
 */
parse.host = function(url) {
  return url.hostname + (url.port ? ":" + url.port : "");
};


/**
 * Builds the full URL as a string
 *
 * @param {object} url - URL object
 * @returns {string} Full url as a string
 */
parse.href = function(url) {
  return url.origin + url.pathname + url.search + url.hash;
};


/**
 * Processes a pathname and returns only the path. If a file is present
 * then it is removed, otherwise the same string is returned.
 *
 * @returns {string} directory of the pathname
 */
function directory(pathname) {
  return (pathname.length !== 1 && pathname[pathname.length - 1] !== "/") ?
    pathname.substr(0, pathname.lastIndexOf("/")) :
    pathname;
}


Url.parser = {
  resolve : resolve,
  parse   : parse,
  join    : join
};


//
// This chunk of code below enables nodejs URL module.  Useful for testing purposes.
//
//Url.parser = require('url');
//Url.parser.join = function(baseString, urlString) {
//  var resolved = Url.parser.resolve(baseString || "", urlString);
//  var url      = Url.parser.parse(resolved);
//  url.origin   = url.protocol ? (url.protocol + "//" + url.host) : "";
//  url.hash     = url.hash     || "";
//  url.host     = url.host     || "";
//  url.hostname = url.hostname || "";
//  url.password = url.password || "";
//  url.pathname = url.pathname || "";
//  url.port     = url.port     || "";
//  url.protocol = url.protocol || "";
//  url.search   = url.search   || "";
//  url.username = url.username || "";
//  return url;
//};


module.exports = Url;

},{"path":1}]},{},[3])(3)
});