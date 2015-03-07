define([
  "chai"
], function(chai) {

  window.chai   = chai;
  window.expect = chai.expect;
  window.assert = chai.assert;

  mocha.setup("bdd");

  require([
    "test/spec/file",
    "test/spec/resolver",
    "test/spec/url"
  ], function () {
    if (window.mochaPhantomJS) {
      window.mochaPhantomJS.run();
    } else {
      mocha.run();
    }
  });
});
