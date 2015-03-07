define(["dist/bit-loader"], function(Bitloader) {
  var Registry = Bitloader.Registry;

  describe("Registry Suite", function() {
    describe("when registering new context", function() {
      describe("with no id", function() {
        var context;
        beforeEach(function() {
          context = Registry.getById();
        });

        it("then context is an object", function() {
          expect(context).to.be.an("object");
        });

        it("then context._id is a string", function() {
          expect(context._id).to.be.a("string");
        });

        it("then context.modules is an object", function() {
          expect(context.modules).to.be.an("object");
        });

        describe("when reading it from the registry", function() {
          var context, ctx;
          beforeEach(function() {
            context = Registry.getById();
            ctx = Registry.getById(context._id);
          });

          it("then the read ctx is an object", function() {
            expect(ctx).to.be.an("object");
          });

          it("then contexts are the same", function() {
            expect(ctx).to.equal(context);
          });

          it("then ids match", function() {
            expect(ctx._id).to.equal(context._id);
          });
        });


        describe("when clearing it from the registry", function() {
          var context, ctx;
          beforeEach(function() {
            context = Registry.getById();
            ctx = Registry.clearById(context._id);
          });

          it("then the value returned from clear is the one that was registered", function() {
            expect(ctx).to.equal(context);
          });

          it("then registering the same id creates a new context with that id", function() {
            var new_ctx = Registry.getById(ctx._id);
            expect(new_ctx).to.be.an("object");
          });

          it("then registering the same id does not create the same context", function() {
            var new_ctx = Registry.getById(ctx._id);
            expect(ctx).to.not.equal(new_ctx);
          });

          it("then registering the same id create a context with the specified id", function() {
            var new_ctx = Registry.getById(ctx._id);
            expect(ctx._id).to.equal(new_ctx._id);
          });
        });
      });
    });

  });
});
