define(["dist/bit-loader"], function(Bitloader) {

  describe("Bitloader Suite", function() {
    var bitloader;
    beforeEach(function() {
      bitloader = new Bitloader({
        "baseUrl": "../",
        "packages": [{
          "location": "tests",
          "main": "main",
          "name": "js"
        }]
      });
    });

    it("then bitloader is an instance of `Bitloader`", function() {
      expect(bitloader instanceof(Bitloader)).to.equal(true);
    });

  });

});
