/**
 * babel bits module to convert ESnext feature to ES5 equivalents
 */
var babelCore = require('babel-core');

function babelize(data) {
  _run(data, this.options);
}

babelize.config = function(options) {
  return function babelize(data) {
    _run(data, options);
  };
};


function _run(data, options) {
  options = options || {};
  data.source = babelCore.transform(data.source, options).code;
}

module.exports = babelize;
