var Importer = require("dist/bit-imports");

describe("Register Test Suite", function() {
  describe("When registering a module with no dependencies", function() {
    var importer, moduleA, factoryStub, moduleImportedStub;
    beforeEach(function() {
      importer = Importer.factory();
      moduleA = {"s": "data"};

      moduleImportedStub = sinon.stub();
      factoryStub = sinon.stub().returns(moduleA);
      importer.register("modA", [], factoryStub);
      return importer.import("modA").then(moduleImportedStub);
    });

    it("then module import callback is called with moduleA", function() {
      expect(moduleImportedStub.calledWithExactly(moduleA)).to.equal(true);
    });

    it("then register module factory is called", function() {
      expect(factoryStub.called).to.equal(true);
    });
  });


  describe("When registering a module with one dependency", function() {
    var importer, moduleA, factoryStub, moduleImportedStub;
    beforeEach(function() {
      importer = Importer.factory({
        baseUrl: "."
      });

      moduleA = {"s": "data"};
      moduleImportedStub = sinon.stub();
      factoryStub = sinon.stub().returns(moduleA);
      importer.register("modA", ["js/deep3"], factoryStub);
      return importer.import("modA").then(moduleImportedStub);
    });

    it("then module import callback is called with moduleA", function() {
      expect(moduleImportedStub.calledWithExactly(moduleA)).to.equal(true);
    });

    it("then register module factory is called", function() {
      expect(factoryStub.called).to.equal(true);
    });
  });


  describe("When registering a module with one dependency that has mode `System.register` calls", function() {
    var importer, result, moduleImportedStub;
    beforeEach(function() {
      importer = Importer.factory({
        baseUrl: "."
      });

      moduleImportedStub = sinon.stub().returnsArg(0);
      return importer.import("js/register0").then(moduleImportedStub).then(function(mod) {
        result = mod;
      });
    });

    it("then module import callback is called", function() {
      expect(moduleImportedStub.calledOnce).to.equal(true);
    });

    it("then resulting module is an object ``", function() {
      expect(result).to.be.an("object");
    });

    it("then resulting module.register1 to be an object", function() {
      expect(result.register1).to.be.an("object");
    });

    it("then resulting module.register1.hello to be a string", function() {
      expect(result.register1.hello).to.equal("from module register1");
    });

    it("then resulting module.register1.register2 to be an object", function() {
      expect(result.register1.register2).to.be.an("object");
    });

    it("then resulting module.register1.register2.hello to be a string", function() {
      expect(result.register1.register2.hello).to.equal("from module register2");
    });
  });

  describe("When registering a module with one dependency that has mode `System.register` mixed with AMD and CJS", function() {
    var importer, result, moduleImportedStub;
    beforeEach(function() {
      importer = Importer.factory({
        baseUrl: "."
      });

      moduleImportedStub = sinon.stub().returnsArg(0);
      return importer.import("js/registermix").then(moduleImportedStub).then(function(mod) {
        result = mod;
      });
    });

    it("then module import callback is called", function() {
      expect(moduleImportedStub.calledOnce).to.equal(true);
    });

    it("then resulting module is an object ``", function() {
      expect(result).to.be.an("object");
    });

    it("then resulting module.register1 to be an object", function() {
      expect(result.register1).to.be.an("object");
    });

    it("then resulting module.register1.hello to be a string", function() {
      expect(result.register1.hello).to.equal("from module register1");
    });

    it("then resulting module.register1.register2 to be an object", function() {
      expect(result.register1.register2).to.be.an("object");
    });

    it("then resulting module.register1.register2.hello to be a string", function() {
      expect(result.register1.register2.hello).to.equal("from module register2");
    });

    it("then resulting module.deep3 is an object", function() {
      expect(result.deep3).to.be.an("object");
    });

    it("then resulting module.deep3.deep2 is an object", function() {
      expect(result.deep3.deep2).to.be.an("object");
    });

    it("then resulting module.deep3.deep2.deep1 is an object", function() {
      expect(result.deep3.deep2.deep1).to.be.an("object");
    });

    it("then resulting module.deep3.deep2.deep1.deep0 is an object", function() {
      expect(result.deep3.deep2.deep1.deep0).to.be.an("object");
    });

    it("then resulting module.deep3.deep2.deep1.deep0.hello is 'world'", function() {
      expect(result.deep3.deep2.deep1.deep0.hello).to.equal("world");
    });
  });

});
