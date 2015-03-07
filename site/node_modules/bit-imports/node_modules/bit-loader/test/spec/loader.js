define(["dist/bit-loader"], function(Bitloader) {
  var Loader  = Bitloader.Loader;

  describe("Loader Suite", function() {
    describe("When loading module that is already loaded in `manager`", function() {
      var yes, loader, hasModuleStub, getModuleStub, loaderHasModuleStub, loaderGetModuleStub, moduleLoadedStub, loaderSetModuleStub;

      beforeEach(function() {
        yes = {date: new Date()};
        hasModuleStub = sinon.stub().returns(true);
        getModuleStub = sinon.stub().withArgs("yes").returns(yes);
        moduleLoadedStub = sinon.stub();
        loaderHasModuleStub = sinon.stub();
        loaderGetModuleStub = sinon.stub();
        loaderSetModuleStub = sinon.stub();

        var manager = {
          hasModule: hasModuleStub,
          getModule: getModuleStub
        };

        loader = new Loader(manager);
        loader.hasModule  = loaderHasModuleStub;
        loader.getModule  = loaderGetModuleStub;
        loader.setLoading = loaderSetModuleStub;
        return loader.load("yes").then(moduleLoadedStub);
      });

      it("then `manager.hasModule` is called once", function() {
        expect(hasModuleStub.calledOnce).to.equal(true);
      });

      it("then `manager.hasModule` is called with `yes`", function() {
        expect(hasModuleStub.calledWithExactly("yes")).to.equal(true);
      });

      it("then `manager.getModule` is called once", function() {
        expect(getModuleStub.calledOnce).to.equal(true);
      });

      it("then `manager.getModule` is called with `yes`", function() {
        expect(getModuleStub.calledWithExactly("yes")).to.equal(true);
      });

      it("then module loaded callback with called once", function() {
        expect(moduleLoadedStub.calledOnce).to.equal(true);
      });

      it("then module loaded callback with called with module `yes`", function() {
        expect(moduleLoadedStub.calledWithExactly(yes)).to.equal(true);
      });

      it("then `loader.hasModule` is not called", function() {
        expect(loaderHasModuleStub.called).is.equal(false);
      });

      it("then `loader.getModule` is not called", function() {
        expect(loaderGetModuleStub.called).is.equal(false);
      });

      it("then `loader.setLoading` is not called", function() {
        expect(loaderSetModuleStub.called).to.equal(false);
      });
    });


    describe("When loading module that is loaded in `loader` but not yet compiled to a `Module`", function() {
      var yes, loader, moduleLoadedStub, hasModuleStub, getModuleStub, loaderIsLadedStub, loaderBuildModuleStub, loaderSetModuleStub;

      beforeEach(function() {
        yes = {yes: new Date()};
        moduleLoadedStub = sinon.stub();
        hasModuleStub = sinon.stub().returns(false);
        getModuleStub = sinon.stub();
        loaderIsLadedStub = sinon.stub().withArgs("yes").returns(true);
        loaderBuildModuleStub = sinon.stub().withArgs("yes").returns(yes);
        loaderSetModuleStub = sinon.stub();

        var manager = {
          hasModule: hasModuleStub,
          getModule: getModuleStub
        };

        loader = new Loader(manager);
        loader.isLoaded         = loaderIsLadedStub;
        loader.asyncBuildModule = loaderBuildModuleStub;
        loader.setModule        = loaderSetModuleStub;
        return loader.load("yes").then(moduleLoadedStub);
      });

      it("then `manager.hasModule` is called with `yes`", function() {
        expect(hasModuleStub.called).to.equal(true);
      });

      it("then `manager.getModule` is not called", function() {
        expect(getModuleStub.called).to.equal(false);
      });

      it("then `loader.isLoaded` is called once", function() {
        expect(loaderIsLadedStub.calledOnce).to.equal(true);
      });

      it("then `loader.isLoaded` is called with `yes`", function() {
        expect(loaderIsLadedStub.calledWithExactly("yes")).to.equal(true);
      });

      it("then `loader.buildModule` is called once", function() {
        expect(loaderBuildModuleStub.calledOnce).to.equal(true);
      });

      it("then `loader.buildModule` is called with `yes`", function() {
        expect(loaderBuildModuleStub.calledWithExactly("yes")).to.equal(true);
      });

      it("then `loader.setLoading` is not called", function() {
        expect(loaderSetModuleStub.called).to.equal(false);
      });
    });


    describe("When module is loaded with a module meta that has `code` property defined", function() {
      var yes, loader, pipelineFinishedStub, pipelineAssetStub;

      beforeEach(function() {
        yes = {code: new Date()};
        pipelineFinishedStub = sinon.stub();
        pipelineAssetStub    = sinon.stub();

        var manager = {};
        loader = new Loader(manager);
        loader.pipeline.assets[0] = pipelineAssetStub;
        return loader._pipelineModuleMeta(yes).then(pipelineFinishedStub);
      });

      it("then the pipeline runs successfully", function() {
        expect(pipelineFinishedStub.called).to.equal(true);
      });

      it("then pipeline `done` hanlder is called with module meta", function() {
        expect(pipelineFinishedStub.calledWithExactly(yes)).to.equal(true);
      });

      it("then the loader pipeline does not run", function() {
        expect(pipelineAssetStub.called).to.equal(false);
      });
    });


    describe("When module is loaded with a module meta that has `compile` and `source` properties", function() {
      var yes, loader, pipelineFinishedStub, pipelineAssetStub;

      beforeEach(function() {
        yes = {source: "var somecode;", compile: function() {}};
        pipelineFinishedStub = sinon.stub();
        pipelineAssetStub    = sinon.stub();

        var manager = {};
        loader = new Loader(manager);
        loader.pipeline.assets = [pipelineAssetStub];
        return loader._pipelineModuleMeta(yes).then(pipelineFinishedStub);
      });

      it("then the pipeline runs successfully", function() {
        expect(pipelineFinishedStub.called).to.equal(true);
      });

      it("then the pipeline `done` handler is called with module meta", function() {
        expect(pipelineFinishedStub.calledWithExactly(yes)).to.equal(true);
      });

      it("then the loader pipeline does run", function() {
        expect(pipelineAssetStub.called).to.equal(true);
      });
    });


    describe("When module meta is registered with the `register` interface with no dependencies", function() {
      var loader, moduleName, hasModuleStub, setModuleStub, factoryStub, moduleCode;

      beforeEach(function() {
        moduleName = "module1";
        moduleCode = function rad() {};
        factoryStub   = sinon.stub().returns(moduleCode);

        var manager = new Bitloader();
        hasModuleStub = sinon.spy(manager, "hasModule");
        setModuleStub = sinon.spy(manager, "setModule");

        loader = manager.providers.loader;
        loader.register(moduleName, [], factoryStub);
      });

      it("then module meta is registered", function() {
        expect(loader.hasModule(moduleName)).to.equal(true);
      });

      it("then module meta factory is not called", function() {
        expect(factoryStub.called).to.equal(false);
      });

      it("then manager `setModule` is not called", function() {
        expect(setModuleStub.called).to.equal(false);
      });


      describe("when loading registered module meta, the proper Module instance is created", function() {
        var moduleLoaderStub = sinon.stub();
        beforeEach(function() {
          return loader.load(moduleName).then(moduleLoaderStub);
        });

        it("then module loaded callback is called", function() {
          expect(moduleLoaderStub.called).to.equal(true);
        });

        it("then manager `setModule` is called with and instance of module", function() {
          expect(setModuleStub.args[0][0]).to.be.instanceof(Bitloader.Module);
        });

        it("then module instance is created", function() {
          expect(moduleLoaderStub.args[0][0]).to.be.instanceof(Bitloader.Module);
        });
      });

    });


    describe("When module meta is registered with the `register` interface with dependencies", function() {
      var loader, moduleName, hasModuleStub, setModuleStub, getModuleStub, factoryStub, fetchStub, moduleCode, deep1Module;

      beforeEach(function() {
        moduleName    = "module1";
        moduleCode    = function rad() {};
        deep1Module   = {"code":{"deep1": "Some value"}};
        fetchStub     = sinon.stub();
        factoryStub   = sinon.stub().returns(moduleCode);

        fetchStub.withArgs(moduleName).throws(new TypeError("Registered Module must NOT be fetched"));
        fetchStub.withArgs("js/deep1").returns(deep1Module);

        var manager = new Bitloader();
        manager.fetch = fetchStub;
        getModuleStub = sinon.spy(manager, "getModule");
        setModuleStub = sinon.spy(manager, "setModule");
        hasModuleStub = sinon.spy(manager, "hasModule");

        loader = manager.providers.loader;
        loader.register(moduleName, ["js/deep1"], factoryStub);
      });

      it("then module meta is registered", function() {
        expect(loader.isPending(moduleName)).to.equal(true);
      });

      it("then module meta factory is not called", function() {
        expect(factoryStub.called).to.equal(false);
      });

      it("then manager `hasModule` is called", function() {
        expect(hasModuleStub.called).to.equal(true);
      });

      it("then manager `setModule` is not called", function() {
        expect(setModuleStub.called).to.equal(false);
      });

      it("then manager `fetch` is not called", function() {
        expect(fetchStub.called).to.equal(false);
      });


      describe("when loading registered module meta, the proper Module instance is created", function() {
        var moduleLoaderStub = sinon.spy();
        beforeEach(function() {
          return loader.load(moduleName).then(moduleLoaderStub);
        });

        it("then module loaded callback is called", function() {
          expect(moduleLoaderStub.called).to.equal(true);
        });

        it("then module instance is created", function() {
          expect(moduleLoaderStub.args[0][0]).to.be.instanceof(Bitloader.Module);
        });

        it("then manager `setModule` is called with and instance of module", function() {
          expect(setModuleStub.args[0][0]).to.be.instanceof(Bitloader.Module);
        });

        it("then module factory is called with module `deep1`", function() {
          expect(factoryStub.calledWithExactly(deep1Module.code)).to.equal(true);
        });
      });

    });
  });
});
