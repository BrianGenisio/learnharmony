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


    describe("and registering a plugin with handlers for `fetch`, `transform`, `dependency`, and `compile`", function() {
      var resolveStub, fetchStub, defaultFetchStub, transformStub, dependencyStub, compileStub, defaultCompileStub;

      beforeEach(function() {
        defaultCompileStub = sinon.stub();
        defaultFetchStub   = sinon.stub();
        resolveStub        = sinon.spy(function(moduleMeta) {moduleMeta.path = "some/path";});
        fetchStub          = sinon.spy(function(moduleMeta) {moduleMeta.source = "some source";});
        transformStub      = sinon.spy(function(moduleMeta) {moduleMeta.source = "transformed source";});
        dependencyStub     = sinon.spy(function(moduleMeta) {moduleMeta.deps = [];});
        compileStub        = sinon.spy(function(moduleMeta) {moduleMeta.code = "compiled source";});

        bitloader = new Bitloader({
          resolve: resolveStub,
          fetch: fetchStub,
          compile: compileStub
        });

        bitloader.plugin("js", {
          "fetch"      : fetchStub,
          "transform"  : transformStub,
          "dependency" : dependencyStub,
          "compile"    : compileStub
        });

        return bitloader.import("js");
      });


      it("then default 'fetch' is NOT called", function() {
        expect(defaultFetchStub.called).to.equal(false);
      });

      it("then default 'fetch' is NOT called", function() {
        expect(defaultCompileStub.called).to.equal(false);
      });

      it("then `resolve` is called once", function() {
        expect(resolveStub.callCount).to.equal(1);
      });

      it("then `fetch` handler is called once", function() {
        expect(fetchStub.callCount).to.equal(1);
      });

      it("then `fetch` handler is called with a module meta with path `some/path`", function() {
        expect(fetchStub.calledWith(sinon.match({path: "some/path"}))).to.equal(true);
      });

      it("then `transform` handler is called once", function() {
        expect(transformStub.callCount).to.equal(1);
      });

      it("then `dependency` handler is called once", function() {
        expect(dependencyStub.callCount).to.equal(1);
      });

      it("then `compile` handler is called once", function() {
        expect(compileStub.callCount).to.equal(1);
      });
    });

  });

});
