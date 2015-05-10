var babelCore = require('babel-core');
var extend = require('xtend');

function result(value, data) {
  return typeof value === 'function' ? value(data) : value;
}

function babelize(data, options) {
  _run(data, options);
}

babelize.config = function(options) {
  return function babelize(data) {
    _run(data, options);
  };
};

function _run(data, options) {
  options = options || {};
  var settings = extend({}, options);
  settings.filename = result(options.filename, data) || data.path;
  data.source = babelCore.transform(data.source, settings).code;
}

module.exports = babelize;
