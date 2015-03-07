define(["dist/bit-loader"], function(Bitloader) {
  var Module = Bitloader.Module;

  describe("Module Test Suite", function() {

    describe("When creating a ModuleMeta with no options", function() {
      var metaSpy;

      beforeEach(function() {
        metaSpy = sinon.spy(Module.Meta.validate);

        try {
          metaSpy();
        }
        catch(ex) {
        }
      });

      it("then an exception is thrown", function() {
        expect(metaSpy.threw("TypeError")).to.equal(true);
      });

      it("then exception says `Must provide options`", function() {
        expect(metaSpy.exceptions[0].message).to.equal("Must provide options");
      });
    });

    describe("When creating a ModuleMeta with an empty options object", function() {
      var metaSpy;

      beforeEach(function() {
        metaSpy = sinon.spy(Module.Meta.validate);

        try {
          metaSpy({});
        }
        catch(ex) {
        }
      });

      it("then an exception is thrown", function() {
        expect(metaSpy.threw("TypeError")).to.equal(true);
      });

      it("then exception stating that `compile` or `code` must be provided", function() {
        expect(metaSpy.exceptions[0].message).to.equal("ModuleMeta must provide a `source` string and `compile` interface, or `code`.");
      });
    });

    describe("When creating a ModuleMeta with options with only `source`", function() {
      var metaSpy;

      beforeEach(function() {
        metaSpy = sinon.spy(Module.Meta.validate);

        try {
          metaSpy({source: "some source"});
        }
        catch(ex) {
        }
      });

      it("then an exception is thrown", function() {
        expect(metaSpy.threw("TypeError")).to.equal(true);
      });

      it("then exception stating that `compile` or `code` must be provided", function() {
        expect(metaSpy.exceptions[0].message).to.equal("ModuleMeta must provide a `source` string and `compile` interface, or `code`.");
      });
    });

    describe("When creating a ModuleMeta with options with only `compile`", function() {
      var metaSpy;

      beforeEach(function() {
        metaSpy = sinon.spy(Module.Meta.validate);

        try {
          metaSpy({compile: function() {}});
        }
        catch(ex) {
        }
      });

      it("then an exception is thrown", function() {
        expect(metaSpy.threw("TypeError")).to.equal(true);
      });

      it("then exception stating that `compile` or `code` must be provided", function() {
        expect(metaSpy.exceptions[0].message).to.equal("ModuleMeta must provide a `source` string and `compile` interface, or `code`.");
      });
    });


    describe("When creating a ModuleMeta with a `source` property and `compile` a string", function() {
      var metaSpy;

      beforeEach(function() {
        metaSpy = sinon.spy(Module.Meta.validate);

        try {
          metaSpy({source: "function x(){}", compile: "some string"});
        }
        catch(ex) {
        }
      });

      it("then an exception is thrown", function() {
        expect(metaSpy.threw("TypeError")).to.equal(true);
      });

      it("then exception stating that `compile` or `code` must be provided", function() {
        expect(metaSpy.exceptions[0].message).to.equal("ModuleMeta must provide a `source` string and `compile` interface, or `code`.");
      });
    });


    describe("When creating a ModuleMeta with a `source` property and `compile` interface", function() {
      var moduleMeta, metaSpy;

      beforeEach(function() {
        moduleMeta = {source: "function x(){}", compile: function() {}};
        metaSpy = sinon.spy(Module.Meta.validate);

        try {
          metaSpy(moduleMeta);
        }
        catch(ex) {
        }
      });

      it("then ModuleMeta `source` is `function x(){}`", function() {
        expect(moduleMeta.source).to.equal("function x(){}");
      });

      it("then ModuleMeta `compile` is a function", function() {
        expect(moduleMeta.compile).to.be.a("function");
      });
    });


    describe("When creating a ModuleMeta with a `code` property", function() {
      var moduleMeta, metaSpy;

      beforeEach(function() {
        moduleMeta = {code: "some random code"};
        metaSpy = sinon.spy(Module.Meta);

        try {
          metaSpy(moduleMeta);
        }
        catch(ex) {
        }
      });

      it("then ModuleMeta `code` is `some random code`", function() {
        expect(moduleMeta.code).to.equal("some random code");
      });
    });

  });

});
