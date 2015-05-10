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
