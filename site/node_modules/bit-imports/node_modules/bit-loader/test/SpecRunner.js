var chai = require("chai");
window.chai   = chai;
window.expect = chai.expect;
window.assert = chai.assert;

mocha.setup("bdd");

require([
  "test/spec/rule-matcher",
  "test/spec/fetch",
  "test/spec/utils",
  "test/spec/import",
  "test/spec/loader",
  "test/spec/registry",
  "test/spec/middleware",
  "test/spec/module",
  "test/spec/plugin",
  "test/spec/ignore",
  "test/spec/transform",
  "test/spec/bit-loader"
], function() {
  mocha.run();
});
