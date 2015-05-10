/**
 * Copyright (c) 2014 Miguel Castillo.
 * Licensed under MIT
 */

(function() {
  "use strict";

  var Promise = require('Promise');

  var readyStates = {
    UNSENT           : 0, // open()has not been called yet.
    OPENED           : 1, // send()has not been called yet.
    HEADERS_RECEIVED : 2, // send() has been called, and headers and status are available.
    LOADING          : 3, // Downloading; responseText holds partial data.
    DONE             : 4  // The operation is complete.
  };

  function Ajax(options) {
    if (typeof(options) === "string") {
      options = {url: options};
    }

    var deferred = Promise.defer();
    var request  = new XMLHttpRequest(),
        url      = options.url,
        method   = options.method  || "GET",
        data     = options.data    || null,
        headers  = options.headers || {},
        async    = true;

    if (!url) {
      throw new TypeError("Must provide a URL");
    }

    if (options.hasOwnProperty("withCredentials")) {
      request.withCredentials = options.withCredentials;
    }
    
    if (options.hasOwnProperty("timeout")) {
      request.timeout = options.timeout;
    }

    request.onreadystatechange = StateChanged.bind(request, options, deferred);
    request.open(method, url, async, options.user, options.password);

    for (var header in headers) {
      if (headers.hasOwnProperty(header)) {
        request.setRequestHeader(header, headers[header]);
      }
    }

    request.send(data);
    return deferred.promise;
  }

  function StateChanged(options, deferred) {
    var request = this,
        state   = request.readyState;

    if (state === readyStates.DONE) {
      if (request.status === 200) {
        var result = (options.transform || transform)(request.responseText, options.responseType);
        deferred.resolve(result, request);
      }
      else {
        deferred.reject(request);
      }
    }
  }

  function transform(text, type) {
    if (type === 'json') {
      return JSON.parse(text);
    }

    return text;
  }

  module.exports = Ajax;
})();
