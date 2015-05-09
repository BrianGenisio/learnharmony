define(['dist/bit-loader'], function(Bitloader) {

  describe("Transform Test Suite", function() {

    describe("When calling `transform`", function() {
      var bitloader;

      beforeEach(function() {
        bitloader = new Bitloader();
      });


      describe("when transforming an anonymous function", function() {
        var result, source, moduleMeta;

        beforeEach(function() {
          source = "function() {}";
          moduleMeta = {source: source};

          return bitloader.providers.loader
            .transform(moduleMeta)
            .then(function(_result) {
              result = _result;
            });
        });


        it("then result is moduleMeta", function() {
          expect(result).to.equal(moduleMeta);
        });

        it("then result.source is a string", function() {
          expect(result.source).to.be.a('string');
        });

        it("then result.deps to be an array", function() {
          expect(result.deps).to.be.an('array');
        });

        it("then result.deps is empty", function() {
          expect(result.deps.length).to.equal(0);
        });
      });


      describe("when transforming an function and one CJS dependency", function() {
        var result, source, moduleMeta;

        beforeEach(function() {
          source = "var x = require('x'); function hello() {}";
          moduleMeta = {source: source};

          return bitloader.providers.loader
            .transform(moduleMeta)
            .then(function(_result) {
              result = _result;
            });
        });


        it("then result is moduleMeta", function() {
          expect(result).to.equal(moduleMeta);
        });

        it("then result.source is a string", function() {
          expect(result.source).to.be.a('string');
        });

        it("then result.deps to be an array", function() {
          expect(result.deps).to.be.an('array');
        });

        it("then result.deps is empty", function() {
          expect(result.deps.length).to.equal(0);
        });
      });
    });

  });

});
