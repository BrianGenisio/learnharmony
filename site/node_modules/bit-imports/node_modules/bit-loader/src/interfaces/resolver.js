(function() {
  "use strict";

  function Resolver() {
  }

  Resolver.prototype.resolve = function(/*moduleMeta, moduleParent*/) {
    throw new TypeError("Resolver:resolve is not implemented, must be implemented by the consumer code");
  };

  Resolver.prototype.canProcess = function(/*moduleMeta*/) {
    return false;
  };

  module.exports = Resolver;
})();
