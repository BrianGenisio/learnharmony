var Bitloader = require('../../dist/bit-loader.js');
var loader = new Bitloader({}, {fetch: fetchFactory});

loader.import(["like1", "like2"]).then(function(r1, r2) {
  console.log(r1, r2);
});


/**
 * FetchFactory provides a fetch interface that is used by bit loader
 * to load files from storage.
 *
 * @param {Bitloader} loader - bit loader instance
 */
function fetchFactory(loader) {
  function compile() {
    console.log("compile '" + this.name + "'");
    // `this` is an augmented meta module object that has access to manager,
    // which is the instance of loader.
    return new loader.Module({code: this.name + " is compiled"});
  }

  return {
    fetch: function(name) {
      console.log("fetching '" + name + "'");
      // Notice that fetch returns a simple object with a `compile` method.
      // When a `compile` method is provided, a `source` property of type
      // string must also be proivded.
      // This object returned is what we call a module meta object.
      return {compile: compile, source: ""};
    }
  };
}
