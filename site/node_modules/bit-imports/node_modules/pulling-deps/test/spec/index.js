define(["dist/index", "sinon"], function(pulldeps/*, sinon*/) {

  describe("Test suite", function() {
    var dependecies;

    describe("When parsing single `require`", function() {
      beforeEach(function() {
        dependecies = pulldeps("require('test')").dependencies;
      });

      it("then dependencies length is `1`", function() {
        expect(dependecies.length).to.equal(1);
      });

      it("then dependencies[0] is `test`", function() {
        expect(dependecies[0]).to.equal("test");
      });
    });


    describe("When parsing single `require` with an array of dependencies", function() {
      beforeEach(function() {
        dependecies = pulldeps("require(['test'])").dependencies;
      });

      it("then dependencies length is `0`", function() {
        expect(dependecies.length).to.equal(0);
      });
    });


    describe("When parsing single `require` and `use strict`", function() {
      beforeEach(function() {
        dependecies = pulldeps("'use strict'; require('test')").dependencies;
      });

      it("then dependencies length is `1`", function() {
        expect(dependecies.length).to.equal(1);
      });

      it("then dependencies[0] is `test`", function() {
        expect(dependecies[0]).to.equal("test");
      });
    });


    describe("When parsing single `require` assigned to a variable", function() {
      beforeEach(function() {
        dependecies = pulldeps("var test = require('test')").dependencies;
      });

      it("then dependencies length is `1`", function() {
        expect(dependecies.length).to.equal(1);
      });

      it("then dependencies[0] is `test`", function() {
        expect(dependecies[0]).to.equal("test");
      });
    });


    describe("When parsing single `require` assigned to a variable in an if statement", function() {
      beforeEach(function() {
        dependecies = pulldeps("var x = true; if(x){var test = require('test')}").dependencies;
      });

      it("then dependencies length is `1`", function() {
        expect(dependecies.length).to.equal(1);
      });

      it("then dependencies[0] is `test`", function() {
        expect(dependecies[0]).to.equal("test");
      });
    });


    describe("When parsing single `define` with an array", function() {
      beforeEach(function() {
        dependecies = pulldeps("define(['test'], function() {})").dependencies;
      });

      it("then dependencies length is `1`", function() {
        expect(dependecies.length).to.equal(1);
      });

      it("then dependencies[0] is `test`", function() {
        expect(dependecies[0]).to.equal("test");
      });
    });


    describe("When parsing single named `define` with an array of two dependencies", function() {
      beforeEach(function() {
        dependecies = pulldeps("define('whatever name', ['test1', 'test2'], function() {})").dependencies;
      });

      it("then dependencies length is `2`", function() {
        expect(dependecies.length).to.equal(2);
      });

      it("then dependencies[0] is `test1`", function() {
        expect(dependecies[0]).to.equal("test1");
      });

      it("then dependencies[1] is `test2`", function() {
        expect(dependecies[1]).to.equal("test2");
      });
    });


    describe("When parsing single named `define` with an array of two dependencies and two require statements and one is an array", function() {
      beforeEach(function() {
        dependecies = pulldeps("define('whatever name', ['test1', 'test2'], function() {require('test3'); require(['test4']);})").dependencies;
      });

      it("then dependencies length is `3`", function() {
        expect(dependecies.length).to.equal(3);
      });

      it("then dependencies[0] is `test3`", function() {
        expect(dependecies[0]).to.equal("test3");
      });

      it("then dependencies[1] is `test1`", function() {
        expect(dependecies[1]).to.equal("test1");
      });

      it("then dependencies[2] is `test2`", function() {
        expect(dependecies[2]).to.equal("test2");
      });
    });
  });
});

