define(["dist/bit-loader"], function(Bitloader) {

  describe("Fetch Test Suite", function() {

    describe("When calling fetch returns a module meta with `code`", function() {
      var loader, fetchStub, resolveStub, moduleMeta;

      beforeEach(function() {
        moduleMeta = {code: "this is content of the module"};
        fetchStub = sinon.stub().returns(moduleMeta);
        resolveStub = sinon.stub();

        function fetcherFactory() {
          return {
            fetch: fetchStub
          };
        }

        function resolveFactory() {
          return {
            resolve: resolveStub
          };
        }

        loader = new Bitloader({}, {
          fetcher: fetcherFactory,
          resolver: resolveFactory
        });
      });


      describe("When fetching a module called `like`", function() {
        var result;
        beforeEach(function() {
          result = loader.fetch("like");
        });

        it("then fetch is called with `like`", function() {
          expect(fetchStub.calledWithExactly("like")).to.equal(true);
        });

        it("then result from fetch is module meta", function() {
          expect(result).to.equal(moduleMeta);
        });
      });


      describe("When loading a module called `I really like`", function() {
        var result;
        beforeEach(function() {
          return loader.load("I really like").then(function(_result) {
            result = _result;
          });
        });

        it("then fetch is called with `I really like`", function() {
          expect(fetchStub.calledWithExactly(sinon.match({ name: "I really like" }))).to.equal(true);
        });

        it("then result from fetch is module meta", function() {
          expect(result).to.be.an.instanceof(Bitloader.Module);
        });
      });


      describe("When importing a module called `I really like this import`", function() {
        var result;
        beforeEach(function() {
          return loader.import("I really like this import").then(function(_result) {
            result = _result;
          });
        });

        it("then fetch is called with `I really like this import`", function() {
          expect(fetchStub.calledWithExactly(sinon.match({ name: "I really like this import" }))).to.equal(true);
        });

        it("then result from import is `this is content of the module`", function() {
          expect(result).to.equal('this is content of the module');
        });
      });
    });


    describe("When calling fetch returns a module meta with `compile`", function() {
      var loader, fetchStub, resolveStub, compileStub, moduleMeta;

      beforeEach(function() {
        moduleMeta  = {source: ""};
        fetchStub   = sinon.stub().returns(moduleMeta);
        compileStub = sinon.stub().returns(new Bitloader.Module({code: "this is content of the module"}));
        resolveStub = sinon.stub();

        function compilerFactory() {
          return {
            compile: compileStub
          };
        }

        function fetcherFactory() {
          return {
            fetch: fetchStub
          };
        }

        function resolveFactory() {
          return {
            resolve: resolveStub
          };
        }

        loader = new Bitloader({}, {
          fetcher: fetcherFactory,
          compiler: compilerFactory,
          resolver: resolveFactory
        });
      });


      describe("When fetching a module called `like`", function() {
        var result;
        beforeEach(function() {
          result = loader.fetch("like");
          return result;
        });

        it("then fetch is called with `like`", function() {
          expect(fetchStub.calledWithExactly("like")).to.equal(true);
        });

        it("then result from fetch is module meta", function() {
          expect(result).to.equal(moduleMeta);
        });

        it("then module meta compile is not called", function() {
          expect(compileStub.called).to.equal(false);
        });
      });


      describe("When loading a module called `I really like`", function() {
        var result;
        beforeEach(function() {
          return loader.load("I really like").then(function(_result) {
            result = _result;
          });
        });

        it("then fetch is called with `I really like`", function() {
          expect(fetchStub.calledWithExactly(sinon.match({name: "I really like"}))).to.equal(true);
        });

        it("then result from fetch is module meta", function() {
          expect(result).to.be.an.instanceof(Bitloader.Module);
        });

        it("then module meta compile is not called", function() {
          expect(compileStub.called).to.equal(true);
        });
      });


      describe("When importing a module called `I really like this import`", function() {
        var result;
        beforeEach(function() {
          return loader.import("I really like this import").then(function(_result) {
            result = _result;
          });
        });

        it("then fetch is called with `I really like this import`", function() {
          expect(fetchStub.calledWithExactly(sinon.match({name: "I really like this import"}))).to.equal(true);
        });

        it("then result from import is `this is content of the module`", function() {
          expect(result).to.equal('this is content of the module');
        });

        it("then module meta compile is called", function() {
          expect(compileStub.called).to.equal(true);
        });
      });

    });

  });
});
