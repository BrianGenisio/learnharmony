define(["dist/bit-loader"], function(Bitloader) {
  var Importer = Bitloader.Import,
      Promise  = Bitloader.Promise;

  describe("Import Suite", function() {

    describe("when creating an empty `Importer`", function() {
      var importerSpy, exception;
      beforeEach(function() {
        importerSpy = sinon.spy(Importer);
        try {
          new importerSpy();
        }
        catch(ex) {
          exception = ex;
        }
      });

      it("then an exception is thrown", function() {
        expect(importerSpy.threw(exception)).to.equal(true);
      });

      it("then the exception message is `Must provide a manager`", function() {
        expect(exception.message).to.equal("Must provide a manager");
      });
    });


    describe("when importing a module called `no` from options.modules", function() {
      var no, importer, loadStub, moduleImportedStub;

      beforeEach(function() {
        no = {"item": "hello"};
        loadStub = sinon.stub();
        moduleImportedStub = sinon.stub();

        importer = new Importer({
          load: loadStub
        });

        var options = {"modules": {"no": no}};
        return importer.import("no", options)
          .then(moduleImportedStub);
      });

      it("then `manager.load` is not called", function() {
        expect(loadStub.called).to.equal(false);
      });

      it("then module importer callback is called with module `no`", function() {
        expect(moduleImportedStub.calledWithExactly(no)).to.equal(true);
      });
    });


    describe("when importing module `no` and `yes` from options.modules", function() {
      var no, yes, date, importer, loadStub, moduleImportedStub;
      beforeEach(function() {
        date = new Date();
        yes = {"item": date};
        no = {"item": "hello"};

        loadStub = sinon.stub();
        moduleImportedStub = sinon.stub();
        importer = new Importer({
          load: loadStub
        });

        var options = {"modules": {"no": no, "yes": yes}};
        return importer.import(["no", "yes"], options)
          .then(moduleImportedStub);
      });

      it("them module importer callback is called with modules `no` and `yes`", function() {
        expect(moduleImportedStub.calledWithExactly(no, yes)).to.equal(true);
      });

      it("then `manager.load` is not called", function() {
        expect(loadStub.called).to.equal(false);
      });
    });


    describe("when importing module `yes`", function() {
      var importer, date, yes, loadStub, hasModuleStub, getModuleCodeStub, moduleImportedStub;
      beforeEach(function() {
        date = new Date();
        yes = {date: date};
        loadStub = sinon.stub();
        moduleImportedStub = sinon.stub();
        hasModuleStub      = sinon.stub().returns(true);
        getModuleCodeStub  = sinon.stub().returns(yes);

        importer = new Importer({
          load: loadStub,
          hasModule: hasModuleStub,
          getModuleCode: getModuleCodeStub
        });

        return importer.import("yes")
          .then(moduleImportedStub);
      });


      it("then `manager.load` is not called", function() {
        expect(loadStub.called).to.equal(false);
      });

      it("then module importer callback is called with module `yes`", function() {
        expect(moduleImportedStub.calledWithExactly(yes)).to.equal(true);
      });

      it("then `manager.hasModule` is called once", function() {
        expect(hasModuleStub.calledOnce).to.equal(true);
      });

      it("then `manager.hasModuleCode` is called with `yes`", function() {
        expect(hasModuleStub.calledWithExactly("yes")).to.equal(true);
      });

      it("then `manager.getModuleCode` is called once", function() {
        expect(getModuleCodeStub.calledOnce).to.equal(true);
      });

      it("then `manager.getModuleCode` is called with `yes`", function() {
        expect(getModuleCodeStub.calledWithExactly("yes")).to.equal(true);
      });
    });


    describe("when importing modules `no` and `yes`", function() {
      var importer, date, yes, no, loadStub, hasModuleStub, getModuleCodeStub, moduleImportedStub;
      beforeEach(function() {
        date = new Date();
        yes = {date: date};
        no = {meh: "something else"};
        loadStub = sinon.stub();
        moduleImportedStub = sinon.stub();
        hasModuleStub = sinon.stub().returns(true);
        getModuleCodeStub  = sinon.stub();
        getModuleCodeStub.withArgs("no").returns(no);
        getModuleCodeStub.withArgs("yes").returns(yes);

        importer = new Importer({
          hasModule: hasModuleStub,
          getModuleCode: getModuleCodeStub
        });
      });


      describe("and module `no` is loaded", function() {
        beforeEach(function() {
          return importer.import(["no", "yes"])
            .then(moduleImportedStub);
        });

        it("then `manager.load` is not called", function() {
          expect(loadStub.called).to.equal(false);
        });

        it("them module importer callback is called with modules `no` and `yes`", function() {
          expect(moduleImportedStub.calledWithExactly(no, yes)).to.equal(true);
        });

        it("then `manager.hasModuleCode` is called twice - once for each module", function() {
          expect(hasModuleStub.calledTwice).to.equal(true);
        });

        it("then `manager.hasModuleCode` is called with `yes`", function() {
          expect(hasModuleStub.calledWithExactly("yes")).to.equal(true);
        });

        it("then `manager.hasModuleCode` is called with `no`", function() {
          expect(hasModuleStub.calledWithExactly("no")).to.equal(true);
        });

        it("then `manager.getModuleCode` is called twice - once for each module", function() {
          expect(getModuleCodeStub.calledTwice).to.equal(true);
        });

        it("then `manager.getModuleCode` is called with `yes`", function() {
          expect(getModuleCodeStub.calledWithExactly("yes")).to.equal(true);
        });

        it("then `manager.getModuleCode` is called with `no`", function() {
          expect(getModuleCodeStub.calledWithExactly("no")).to.equal(true);
        });
      });


      describe("and module `no` is loaded from options.modules", function() {
        var overriden;
        beforeEach(function() {
          overriden = {"item": "overriden"};
          var options = {"modules": {"no": overriden}};

          return importer.import(["no", "yes"], options)
            .then(moduleImportedStub);
        });

        it("then module importer callback with called with modules `overriden` and `yes`", function() {
          expect(moduleImportedStub.calledWithExactly(overriden, yes)).to.equal(true);
        });

        it("then `manager.load` is not called", function() {
          expect(loadStub.called).to.equal(false);
        });
      });
    });


    describe("When importing module `yes` using the `load` interface", function() {
      describe("and module defines `code`", function() {
        var importer, modYes, loadStub, loadDeferred, hasModuleStub, moduleImportedStub, getModuleCodeStub, factoryStub, setModuleSpy, deleteModuleSpy;
        beforeEach(function() {
          factoryStub = sinon.stub();

          modYes = new Bitloader.Module({
            type: Bitloader.Module.Type.AMD,
            name: 'yes',
            code: "module code",
            factory: factoryStub
          });

          loadDeferred       = Promise.resolve(modYes);
          moduleImportedStub = sinon.stub();
          hasModuleStub = sinon.stub().returns(false);
          getModuleCodeStub  = sinon.stub().returns(modYes.code);
          loadStub = sinon.stub().returns(loadDeferred);

          importer = new Importer({
            load: loadStub,
            hasModule: hasModuleStub,
            getModuleCode: getModuleCodeStub
          });

          setModuleSpy = sinon.spy(importer, "setModule");
          deleteModuleSpy = sinon.spy(importer, "deleteModule");

          return importer.import("yes")
            .then(moduleImportedStub);
        });

        it("then `manager.load` is called once", function() {
          expect(loadStub.calledOnce).to.equal(true);
        });

        it("then `manager.load` is called once", function() {
          expect(loadStub.calledWithExactly('yes')).to.equal(true);
        });

        it("them `module.factory` is not called", function() {
          expect(factoryStub.called).to.equal(false);
        });

        it("then module importer callback is called once", function() {
          expect(moduleImportedStub.calledOnce).to.equal(true);
        });

        it("then module importer callback is called with module `yes`", function() {
          expect(moduleImportedStub.calledWithExactly(modYes.code)).to.equal(true);
        });

        it("then setModule is called once", function() {
          expect(setModuleSpy.calledOnce).to.equal(true);
        });

        it("then setModule is called with `yes`", function() {
          expect(setModuleSpy.calledWith("yes")).to.equal(true);
        });

        it("then removeModule is called once", function() {
          expect(deleteModuleSpy.calledOnce).to.equal(true);
        });

        it("then removeModule is called with `yes`", function() {
          expect(deleteModuleSpy.calledWithExactly("yes")).to.equal(true);
        });
      });
    });

    describe("When registering a module whose factory does not return anything", function() {
      var loader, importDoneStub;

      beforeEach(function() {
        importDoneStub = sinon.stub();
        loader = new Bitloader();
        loader.register("modA", [], function() {});
        return loader.import("modA").then(importDoneStub);
      });

      it("then import callback is called with `undefined`", function() {
        expect(importDoneStub.calledWithExactly(undefined)).to.equal(true);
      });

    });
  });
});
