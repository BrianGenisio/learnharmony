define(["dist/bit-loader"], function(Bitloader) {

  describe("Ignore Test Suite", function() {

    describe("When defining `ignore` rules", function() {
      var bitloader, dependencyStub, transformStub;
      beforeEach(function() {
        bitloader = new Bitloader();
        dependencyStub = sinon.stub();
        transformStub = sinon.stub();
        bitloader.pipelines.transform.use(transformStub);
        bitloader.pipelines.dependency.use(dependencyStub);
      });


      describe("and defining an ignore rule for `dependecy` with match `test.js`", function() {
        beforeEach(function() {
          bitloader.ignore({
            name: "dependency",
            match: "test.js"
          });
        });


        describe("and running pipeline on `test.js`", function() {
          var moduleMeta;
          beforeEach(function() {
            moduleMeta = new Bitloader.Module.Meta({
              "name": "test.js",
              "source": ""
            });
            return bitloader.providers.loader.runPipeline(moduleMeta);
          });

          it("then `transform` is executed", function() {
            expect(transformStub.called).to.equal(true);
          });

          it("then `dependency` is not executed", function() {
            expect(dependencyStub.called).to.equal(false);
          });
        });
      });


      describe("and defining an ignore rule for `dependency` with match `test1.js` and later add `test2.js`", function() {
        beforeEach(function() {
          bitloader.ignore({
            name: "dependency",
            match: "test1.js"
          });

          bitloader.ignore({
            name: "dependency",
            match: "test2.js"
          });
        });

        describe("and running pipeline on `test1.js`", function() {
          var moduleMeta;
          beforeEach(function() {
            moduleMeta = new Bitloader.Module.Meta({
              "name": "test1.js",
              "source": ""
            });
            return bitloader.providers.loader.runPipeline(moduleMeta);
          });

          it("then `transform` is executed", function() {
            expect(transformStub.called).to.equal(true);
          });

          it("then `dependency` is not executed", function() {
            expect(dependencyStub.called).to.equal(false);
          });
        });

        describe("and running pipeline on `test2.js`", function() {
          var moduleMeta;
          beforeEach(function() {
            moduleMeta = new Bitloader.Module.Meta({
              "name": "test2.js",
              "source": ""
            });
            return bitloader.providers.loader.runPipeline(moduleMeta);
          });

          it("then `transform` is executed", function() {
            expect(transformStub.called).to.equal(true);
          });

          it("then `dependency` is not executed", function() {
            expect(dependencyStub.called).to.equal(false);
          });
        });
      });


      describe("and defining one generic ignore rule with match `test.js`", function() {
        beforeEach(function() {
          bitloader.ignore({
            match: "test.js"
          });
        });

        describe("and running pipeline on `test.js`", function() {
          var moduleMeta;
          beforeEach(function() {
            moduleMeta = new Bitloader.Module.Meta({
              "name": "test.js",
              "source": ""
            });
            return bitloader.providers.loader.runPipeline(moduleMeta);
          });

          it("then `transform` is not executed", function() {
            expect(transformStub.called).to.equal(false);
          });

          it("then `dependency` is not executed", function() {
            expect(dependencyStub.called).to.equal(false);
          });
        });

        describe("and running pipeline on `doesrun.js`", function() {
          var moduleMeta;
          beforeEach(function() {
            moduleMeta = new Bitloader.Module.Meta({
              "name": "doesrun.js",
              "source": ""
            });
            return bitloader.providers.loader.runPipeline(moduleMeta);
          });

          it("then `transform` is executed", function() {
            expect(transformStub.called).to.equal(true);
          });

          it("then `dependency` is executed", function() {
            expect(dependencyStub.called).to.equal(true);
          });
        });

      });

    });

  });

});
