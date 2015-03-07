var Importer = require("dist/bit-imports");

describe("Packages Test Suite", function() {
  var importer;
  beforeEach(function() {
    importer = Importer.factory({
      baseUrl: "../",
      packages: [
        {
          location: "test",
          main: "main",
          name: "js"
        }
      ]
    });
  });

  describe("When Importing a number", function() {
    var number;
    beforeEach(function() {
      return importer.import("js/number.js")
        .then(function (_number) {
          number = _number;
        });
    });

    it("then the number is 3.14", function() {
      expect(number).to.equal(3.14);
    });
  });

  describe("When Importing an empty object", function() {
    var result;
    beforeEach(function() {
      return importer.import("js/emptyobject.js")
        .then(function (_result) {
          result = _result;
        });
    });

    describe("and the empty object is loaded", function () {
      it("then the result is an object", function() {
        expect(result).to.be.an("object");
      });

      it("then the result is an object with no properties", function() {
        expect(Object.keys(result).length).to.equal(0);
      });
    });
  });

  describe("When importing an empty object and a string", function() {
    var emptyobject, emptystring;
    beforeEach(function () {
      return importer.import(["js/emptyobject", "js/emptystring"])
        .then(function (_emptyobject, _emptystring) {
          emptyobject = _emptyobject;
          emptystring = _emptystring;
        });
    });

    describe("and the empty object is loaded", function() {
      it("then `emptyobject` is an object", function() {
        expect(emptyobject).to.be.an("object");
      });
      it("then `emptyobject` does not have properties", function() {
        expect(Object.keys(emptyobject).length).to.equal(0);
      });
    });

    describe("and the empty string is loaded", function() {
      it("then `emptystring` is a string", function() {
        expect(emptystring).to.be.a("string");
      });
      it("then `emptystring` has length 0", function() {
        expect(emptystring.length).to.equal(0);
      });
    });
  });

  describe("When Importing nested dependencies in deep3", function() {
    var deep3;
    beforeEach(function () {
      return importer.import("test/js/deep3")
        .then(function (_result) {
          deep3 = _result;
        });
    });

    describe("and deep3 is loaded", function () {
      it("then deep3 is an object", function () {
        expect(deep3).to.be.an("object");
      });

      it("then deep3 has only one property", function () {
        expect(Object.keys(deep3).length).to.equal(1);
      });

      it("then deep2 is an object", function () {
        expect(deep3.deep2).to.be.an("object");
      });

      it("then deep2 has only one property", function () {
        expect(Object.keys(deep3.deep2).length).to.equal(1);
      });

      it("then deep1 is an object", function () {
        expect(deep3.deep2.deep1).to.be.an("object");
      });

      it("then deep1 has only one property", function () {
        expect(Object.keys(deep3.deep2.deep1).length).to.equal(1);
      });

      it("then deep0 is an object", function () {
        expect(deep3.deep2.deep1.deep0).to.be.an("object");
      });

      it("then deep0 has only two properties", function () {
        expect(Object.keys(deep3.deep2.deep1.deep0).length).to.equal(2);
      });

      it("then deep0 has a property `hello` that is a string", function () {
        expect(deep3.deep2.deep1.deep0.hello).to.be.a("string");
      });

      it("then deep0 has a property `hello` with a value of `world`", function () {
        expect(deep3.deep2.deep1.deep0.hello).to.equal("world");
      });

      it("then deep0 has a property `init` that is a function", function () {
        expect(deep3.deep2.deep1.deep0.init).to.be.a("function");
      });
    });
  });

  describe("When Importing package called `js`", function() {
    var deep3;
    beforeEach(function () {
      return importer.import("js")
        .then(function (_deep3) {
          deep3 = _deep3;
        });
    });

    describe("and deep3 is loaded", function () {
      it("then deep3 is an object", function () {
        expect(deep3).to.be.an("object");
      });

      it("then deep3 has only one property", function () {
        expect(Object.keys(deep3).length).to.equal(1);
      });

      it("then deep2 is an object", function () {
        expect(deep3.deep2).to.be.an("object");
      });

      it("then deep2 has only one property", function () {
        expect(Object.keys(deep3.deep2).length).to.equal(1);
      });

      it("then deep1 is an object", function () {
        expect(deep3.deep2.deep1).to.be.an("object");
      });

      it("then deep1 has only one property", function () {
        expect(Object.keys(deep3.deep2.deep1).length).to.equal(1);
      });

      it("then deep0 is an object", function () {
        expect(deep3.deep2.deep1.deep0).to.be.an("object");
      });

      it("then deep0 has only two properties", function () {
        expect(Object.keys(deep3.deep2.deep1.deep0).length).to.equal(2);
      });

      it("then deep0 has a property `hello` that is a string", function () {
        expect(deep3.deep2.deep1.deep0.hello).to.be.a("string");
      });

      it("then deep0 has a property `hello` with a value of `world`", function () {
        expect(deep3.deep2.deep1.deep0.hello).to.equal("world");
      });

      it("then deep0 has a property `init` that is a function", function () {
        expect(deep3.deep2.deep1.deep0.init).to.be.a("function");
      });
    });
  });
});
