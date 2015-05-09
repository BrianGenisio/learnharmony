define(['dist/bit-loader'], function(Bitloader) {
  var Middleware = Bitloader.Middleware,
      Promise    = Bitloader.Promise;

  describe("Middleware Test Suite", function() {

    describe("When registering one middleware as an object with name `test`", function() {
      var middleware, testMiddlewareStub;
      beforeEach(function() {
        middleware = new Middleware();
        testMiddlewareStub = sinon.stub();
        middleware.use({name: "test", handler: testMiddlewareStub});
      });


      describe("and re-registering it to add a `filter`", function() {
        var provider;
        beforeEach(function() {
          middleware.use({name: "test", filter: "**/*.js"});
          provider = middleware.getProvider("test");
        });

        it("then middleware `test` provider has a new property `filter`", function() {
          expect(provider.hasOwnProperty("filter")).to.equal(true);
        });

        it("then middleware `test` provider `filter` property is `**/*.js`", function() {
          expect(provider.filter).to.equal("**/*.js");
        });
      });


      describe("and running the `test` middleware with no arguments", function() {
        beforeEach(function() {
          return middleware.run("test");
        });

        it("then `test` middleware is called only once", function() {
          expect(testMiddlewareStub.calledOnce).to.equal(true);
        });

        it("then `test` middleware is called with no arguments", function() {
          expect(testMiddlewareStub.args[0].length).to.equal(0);
        });
      });


      describe("and running the `test` middleware with 1 argument", function() {
        var timestamp;
        beforeEach(function() {
          timestamp = (new Date()).getTime();
          return middleware.run("test", timestamp);
        });

        it("then `test` middleware is called only once", function() {
          expect(testMiddlewareStub.calledOnce).to.equal(true);
        });

        it("then `test` middleware is called with 1 arguments", function() {
          expect(testMiddlewareStub.args[0].length).to.equal(1);
        });

        it("then `test` middleware is called with `timestamp`", function() {
          expect(testMiddlewareStub.args[0][0]).to.equal(timestamp);
        });
      });
    });


    describe("When adding three providers `sweet`, `sour`, `chicken`", function() {

      describe("and all providers run succesfully", function() {
        var middleware, sweetMiddlewareStub, sourMiddlewareStub, chickenMiddlewareStub;
        beforeEach(function() {
          middleware = new Middleware();
          sweetMiddlewareStub = sinon.stub();
          sourMiddlewareStub = sinon.stub();
          chickenMiddlewareStub = sinon.stub();
          middleware.use({name: "sweet", handler: sweetMiddlewareStub});
          middleware.use({name: "sour", handler: sourMiddlewareStub});
          middleware.use({name: "chicken", handler: chickenMiddlewareStub});
        });


        describe("and running `sweet` middleware with no arguments", function() {
          beforeEach(function() {
            return middleware.run("sweet");
          });

          it("then `sweet` middleware is called once", function() {
            expect(sweetMiddlewareStub.calledOnce).to.equal(true);
          });

          it("then `sweet` middleware is called with no arguments", function() {
            expect(sweetMiddlewareStub.args[0].length).to.equal(0);
          });

          it("then `sour` middleware is not called", function() {
            expect(sourMiddlewareStub.called).to.equal(false);
          });

          it("then `chicken` middleware is not called", function() {
            expect(chickenMiddlewareStub.called).to.equal(false);
          });
        });


        describe("and running `sweet` and `chicken` middlewares with no arguments", function() {
          beforeEach(function() {
            return middleware.run(["sweet", "chicken"]);
          });

          it("then `sweet` middleware is called once", function() {
            expect(sweetMiddlewareStub.calledOnce).to.equal(true);
          });

          it("then `sour` middleware is not called", function() {
            expect(sourMiddlewareStub.called).to.equal(false);
          });

          it("then `chicken` middleware is called once", function() {
            expect(chickenMiddlewareStub.calledOnce).to.equal(true);
          });
        });


        describe("and running `sweet` and `chicken` middlewares with `test value` argument", function() {
          var testValue = "test value";
          beforeEach(function() {
            return middleware.run(["sweet", "chicken"], testValue);
          });

          it("then `sweet` middleware is called once", function() {
            expect(sweetMiddlewareStub.calledOnce).to.equal(true);
          });

          it("then `sweet` middleware is called with argument `test value`", function() {
            expect(sweetMiddlewareStub.calledWithExactly("test value")).to.equal(true);
          });

          it("then `sour` middleware is not called", function() {
            expect(sourMiddlewareStub.called).to.equal(false);
          });

          it("then `chicken` middleware is called once", function() {
            expect(chickenMiddlewareStub.calledOnce).to.equal(true);
          });

          it("then `chicken` middleware is called with argument `test value`", function() {
            expect(chickenMiddlewareStub.calledWithExactly("test value")).to.equal(true);
          });
        });


        describe("and running all middlewares with no arguments", function() {
          beforeEach(function() {
            return middleware.runAll();
          });

          it("then `sweet` middleware is called once", function() {
            expect(sweetMiddlewareStub.calledOnce).to.equal(true);
          });

          it("then `sour` middleware is called once", function() {
            expect(sourMiddlewareStub.calledOnce).to.equal(true);
          });

          it("then `chicken` middleware is called once", function() {
            expect(chickenMiddlewareStub.calledOnce).to.equal(true);
          });
        });
      });


      describe("and `sour` provider returns false to stop middleware chain", function() {
        var middleware, sweetMiddlewareStub, sourMiddlewareStub, chickenMiddlewareStub;
        beforeEach(function() {
          middleware = new Middleware();
          sweetMiddlewareStub = sinon.stub();
          sourMiddlewareStub = sinon.stub().returns(false);
          chickenMiddlewareStub = sinon.stub();
          middleware.use({name: "sweet", handler: sweetMiddlewareStub});
          middleware.use({name: "sour", handler: sourMiddlewareStub});
          middleware.use({name: "chicken", handler: chickenMiddlewareStub});
        });

        describe("and running all providers", function() {
          beforeEach(function() {
            return middleware.runAll();
          });

          it("then `sweet` provider is called once", function() {
            expect(sweetMiddlewareStub.calledOnce).to.equal(true);
          });

          it("then `sour` provider is called once", function() {
            expect(sourMiddlewareStub.calledOnce).to.equal(true);
          });

          it("then `chicken` provider is never called", function() {
            expect(chickenMiddlewareStub.called).to.equal(false);
          });
        });
      });


      describe("and `sour` provider throws an exception", function() {
        var middleware, sweetMiddlewareStub, sourMiddlewareStub, chickenMiddlewareStub, typeErrorException;
        beforeEach(function() {
          typeErrorException = new TypeError("Don't run any other providers");
          middleware = new Middleware();
          sweetMiddlewareStub = sinon.stub();
          sourMiddlewareStub = sinon.stub().throws(typeErrorException);
          chickenMiddlewareStub = sinon.stub();
          middleware.use({name: "sweet", handler: sweetMiddlewareStub});
          middleware.use({name: "sour", handler: sourMiddlewareStub});
          middleware.use({name: "chicken", handler: chickenMiddlewareStub});
        });

        describe("and running all providers", function() {
          var deferred, error;
          beforeEach(function() {
            return new Promise(function(resolve) {
              deferred = middleware.runAll().then(function(err) {
                error = err;
                resolve();
              });
            });
          });

          it("then `sweet` provider is called once", function() {
            expect(sweetMiddlewareStub.calledOnce).to.equal(true);
          });

          it("then `sour` provider is called once", function() {
            expect(sourMiddlewareStub.calledOnce).to.equal(true);
          });

          it("then `sour` provider throws `TypeError`", function() {
            expect(sourMiddlewareStub.threw(typeErrorException)).to.equal(true);
          });

          it("then `chicken` provider is never called", function() {
            expect(chickenMiddlewareStub.called).to.equal(false);
          });

          it("then promise sequence is rejected", function() {
            expect(deferred.state()).to.equal("rejected");
          });

          it("then promise sequence reports error", function() {
            expect(error).to.equal(typeErrorException);
          });
        });
      });
    });


    describe("When registering a middleware provider as a string `concat`", function() {
      var middleware, importStub, handlerStub;
      beforeEach(function() {
        handlerStub = sinon.stub();
        importStub  = sinon.stub().returns(Promise.resolve(handlerStub));
        middleware  = new Middleware({import: importStub});
        middleware.use("concat");
      });


      describe("and running the middleware will `import` the provider", function() {
        describe("and calling `concat` with no arguments", function() {
          beforeEach(function() {
            return middleware.run("concat");
          });

          it("then `importStub` is called once", function() {
            expect(importStub.calledOnce).to.equal(true);
          });

          it("then `importStub` is called with `concat`", function() {
            expect(importStub.calledWithExactly("concat")).to.equal(true);
          });

          it("then `handlerStub` is called once", function() {
            expect(handlerStub.calledOnce).to.equal(true);
          });

          it("then `handlerStub` is called with no arguments", function() {
            expect(handlerStub.args[0].length).to.equal(0);
          });
        });

        describe("and calling `concat` with one argument `test value`", function() {
          var testValue;
          beforeEach(function() {
            testValue = "test value";
            return middleware.run("concat", testValue);
          });

          it("then `importStub` is called once", function() {
            expect(importStub.calledOnce).to.equal(true);
          });

          it("then `importStub` is called with `concat`", function() {
            expect(importStub.calledWithExactly("concat")).to.equal(true);
          });

          it("then `handlerStub` is called once", function() {
            expect(handlerStub.calledOnce).to.equal(true);
          });

          it("then `handlerStub` is called with `test value`", function() {
            expect(handlerStub.calledWithExactly(testValue)).to.equal(true);
          });

          it("then `handlerStub` is called as an instance of provider", function() {
            expect(handlerStub.thisValues[0] instanceof(Middleware.Provider)).to.equal(true);
          });
        });
      });
    });


    describe("When registering three middleware providers with the individual calls to `use` method", function() {
      var middleware, providerStub;
      beforeEach(function() {
        middleware = new Middleware();
        providerStub = sinon.stub();
        providerStub.onFirstCall().returns("sweet");
        providerStub.onSecondCall().returns("sour");
        providerStub.onThirdCall().returns("chicken");

        middleware.use({name: "sweet", handler: providerStub});
        middleware.use({name: "sour", handler: providerStub});
        middleware.use({name: "chicken", handler: providerStub});
      });

      describe("and running all providers, they are called in the order in which they were registered", function() {
        beforeEach(function() {
            return middleware.runAll();
        });

        it("then provider `sweet` is called first", function() {
          expect(providerStub.returnValues[0]).to.equal("sweet");
        });

        it("then provider `sour` is called second", function() {
          expect(providerStub.returnValues[1]).to.equal("sour");
        });

        it("then provider `chicken` is called third", function() {
          expect(providerStub.returnValues[2]).to.equal("chicken");
        });
      });
    });


    describe("When registering three middleware providers with a single call to `use` method", function() {
      var middleware, providerStub;
      beforeEach(function() {
        middleware = new Middleware();
        providerStub = sinon.stub();
        providerStub.onFirstCall().returns("sweet");
        providerStub.onSecondCall().returns("sour");
        providerStub.onThirdCall().returns("chicken");

        middleware.use([
          {name: "sweet", handler: providerStub},
          {name: "sour", handler: providerStub},
          {name: "chicken", handler: providerStub}
        ]);
      });

      describe("and running all providers, they are called in the order in which they were registered", function() {
        beforeEach(function() {
            return middleware.runAll();
        });

        it("then provider `sweet` is called first", function() {
          expect(providerStub.returnValues[0]).to.equal("sweet");
        });

        it("then provider `sour` is called second", function() {
          expect(providerStub.returnValues[1]).to.equal("sour");
        });

        it("then provider `chicken` is called third", function() {
          expect(providerStub.returnValues[2]).to.equal("chicken");
        });
      });
    });


    describe("When registering 6 middleware providers. Two in a single call and the other two in seperate calls and the last 2 in a single call to `use` method", function() {
      var middleware, providerStub;
      beforeEach(function() {
        middleware = new Middleware();
        providerStub = sinon.stub();
        providerStub.onCall(0).returns("sweet");
        providerStub.onCall(1).returns("sour");
        providerStub.onCall(2).returns("chicken");
        providerStub.onCall(3).returns("dinner");
        providerStub.onCall(4).returns("very");
        providerStub.onCall(5).returns("spicy");

        middleware.use([
          {name: "sweet", handler: providerStub},
          {name: "sour", handler: providerStub},
        ]);

        middleware.use({name: "chicken", handler: providerStub});
        middleware.use({name: "dinner", handler: providerStub});

        middleware.use([
          {name: "very", handler: providerStub},
          {name: "spicy", handler: providerStub},
        ]);
      });

      describe("and running all providers, they are called in the order in which they were registered", function() {
        beforeEach(function() {
            return middleware.runAll();
        });

        it("then provider `sweet` is called first", function() {
          expect(providerStub.returnValues[0]).to.equal("sweet");
        });

        it("then provider `sour` is called second", function() {
          expect(providerStub.returnValues[1]).to.equal("sour");
        });

        it("then provider `chicken` is called third", function() {
          expect(providerStub.returnValues[2]).to.equal("chicken");
        });

        it("then provider `dinner` is called fourth", function() {
          expect(providerStub.returnValues[3]).to.equal("dinner");
        });

        it("then provider `very` is called fifth", function() {
          expect(providerStub.returnValues[4]).to.equal("very");
        });

        it("then provider `spicy` is called sixth", function() {
          expect(providerStub.returnValues[5]).to.equal("spicy");
        });
      });
    });

  });
});
