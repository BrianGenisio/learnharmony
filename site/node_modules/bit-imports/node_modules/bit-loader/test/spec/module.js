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

      it("then exception stating that `source` or `code` must be provided", function() {
        expect(metaSpy.exceptions[0].message).to.equal("ModuleMeta must provide a `source` string or `code`.");
      });
    });

    describe("When creating a ModuleMeta with options with only `source`", function() {
      var metaSpy;

      beforeEach(function() {
        metaSpy = sinon.spy(Module.Meta.validate);
        metaSpy({source: "some source"});
      });

      it("then an exception is not thrown", function() {
        expect(metaSpy.threw("TypeError")).to.equal(false);
      });
    });


    describe("When creating a ModuleMeta with a `source` string", function() {
      var metaSpy;

      beforeEach(function() {
        metaSpy = sinon.spy(Module.Meta.validate);

        try {
          metaSpy({source: "function x(){}"});
        }
        catch(ex) {
        }
      });

      it("then an exception is not thrown", function() {
        expect(metaSpy.threw("TypeError")).to.equal(false);
      });
    });


    describe("When creating a ModuleMeta with a `code` property", function() {
      var moduleMeta, metaSpy;

      beforeEach(function() {
        moduleMeta = {code: "some random code"};
        metaSpy = sinon.spy(Module.Meta.validate);

        try {
          metaSpy(moduleMeta);
        }
        catch(ex) {
        }
      });

      it("then an exception is not thrown", function() {
        expect(metaSpy.threw("TypeError")).to.equal(false);
      });

      it("then ModuleMeta `code` is `some random code`", function() {
        expect(moduleMeta.code).to.equal("some random code");
      });
    });

  });

});
