require.config({
  "baseUrl": "../",
  "paths": {
    "mocha": "../node_modules/mocha/mocha",
    "chai": "../node_modules/chai/chai",
    "sinon": "../node_modules/sinon/pkg/sinon"
  },
  "shim": {
    "mocha": {
      "exports": "mocha"
    }
  },
  "urlArgs": 'bust=' + (new Date()).getTime()
});
