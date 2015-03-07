var Bitloader = require('../../dist/bit-loader.js');
var Utils = Bitloader.Utils;
var loader = new Bitloader();

// Register instance we are going to be requesting shortly
loader.register("like1", [], function(){return "Stuff";});
loader.register("like2", [], Utils.noop);

loader
  .import(["like1", "like2"])
  .then(function(r1, r2) {
    console.log(r1, r2);
  });
