define(["dist/bit-loader"], function(Bitloader) {
  var Utils = Bitloader.Utils;

  describe("Utils Suite", function() {
    describe("when extend into an empty target object", function() {
      describe("no object", function() {
        var result;
        beforeEach(function() {
          result = Utils.extend();
        });

        it("then result is an object", function() {
          expect(result).to.be.an('object');
        });

        it("then result object is empty has no properties - it's an empty object", function() {
          expect(Object.keys(result).length).to.equal(0);
        });
      });

      describe("empty object", function() {
        var result, target;
        beforeEach(function() {
          target = {};
          result = Utils.extend(target);
        });

        it("then result and target are the same object", function() {
          expect(result).to.equal(target);
        });

        it("then result is an object", function() {
          expect(result).to.be.an('object');
        });

        it("then result object has no proeprties - it's an empty object", function() {
          expect(Object.keys(result).length).to.equal(0);
        });
      });

      describe("three objects", function() {
        describe("when all object define the same property", function() {
          var result, target;
          beforeEach(function() {
            target = {};
            result = Utils.extend(target, {"one": "dont"}, {"two": "twotest", "one": "onetest"}, {"two": "twotest", "one": "twotest"});
          });

          it("then result and target are the same object", function() {
            expect(result).to.equal(target);
          });

          it("then result is an object", function() {
            expect(result).to.be.an("object");
          });

          it("then result.one is 'twotest'", function() {
            expect(result.one).to.equal("twotest");
          });

          it("then result.two is 'twotest'", function() {
            expect(result.two).to.equal("twotest");
          });
        });
      });
    });


    describe("when extend into a non target object", function() {
      describe("an empty object", function() {
        var result;
        beforeEach(function() {
          result = Utils.extend({"one": "dont"}, {"one": "do", "two": "it"});
        });

        it("then result is an object", function() {
          expect(result).to.be.an('object');
        });

        it("then result has two properties", function() {
          expect(Object.keys(result).length).to.equal(2);
        });
      });

      describe("two different objects with property 'one' in all of them", function() {
        var result;
        beforeEach(function() {
          result = Utils.extend({"one": "dont"}, {"two": "twotest", "one": "onetest"}, {"two": "twotest", "one": "twotest"});
        });

        it("result is an object", function() {
          expect(result).to.be.an("object");
        });

        it("result object has two properties", function() {
          expect(Object.keys(result).length).to.equal(2);
        });

        it("result.one is twotest", function() {
          expect(result.one).to.equal("twotest");
        });

        it("result.two is twotest", function() {
          expect(result.two).to.equal("twotest");
        });
      });
    });


    describe("when merge", function() {
      describe("no object", function() {
        var result;
        beforeEach(function() {
          result = Utils.merge();
        });

        it("then result is an object", function() {
          expect(result).to.be.an('object');
        });

        it("then result object has no properties - it's an empty object ", function() {
          expect(Object.keys(result).length).to.equal(0);
        });
      });

      describe("empty object", function() {
        var result, target;
        beforeEach(function() {
          target = {};
          result = Utils.merge(target);
        });

        it("then result is target", function() {
          expect(result).to.equal(target);
        });

        it("then result is an object", function() {
          expect(result).to.be.an('object');
        });

        it("then result has no properties - it's an empty object", function() {
          expect(Object.keys(result).length).to.equal(0);
        });
      });

      describe("two objects with the same property", function() {
        var result, target;
        beforeEach(function() {
          target = {};
          result = Utils.merge(target, {"one": "dont"}, {"two": "twotest", "one": "onetest"});
        });

        it("then result is target", function() {
          expect(result).to.equal(target);
        });

        it("then result is an object", function() {
          expect(result).to.be.an("object");
        });

        it("then result.one is 'ontest'", function() {
          expect(result.one).to.equal("onetest");
        });

        it("then result.two is 'twotest'", function() {
          expect(result.two).to.equal("twotest");
        });
      });


      describe("two objects with the same property of type `Array` using a defaults object", function() {
        var result, target, defaults, package;
        beforeEach(function() {
          package = {
            location : "tests",
            main     : "main",
            name     : "js"
          };

          defaults = {
            packages : []
          };

          var source1 = {
            packages: [package],
            date: (new Date())
          };

          target = Utils.merge({}, defaults, source1);
          result = Utils.merge(target, {"one": ["onetest"]});
        });

        it("then result is target", function() {
          expect(result).to.equal(target);
        });

        it("then result is an object", function() {
          expect(result).to.be.an("object");
        });

        it("then defaults.packages is an empty array", function() {
          expect(defaults.packages.length).to.equal(0);
        });

        it("then defaults.date is undefined", function() {
          expect(defaults.date).to.be.undefined();
        });

        it("then result.one is and Array", function() {
          expect(result.one).to.be.an("Array");
        });

        it("then result.packages has length of 1", function() {
          expect(result.packages.length).to.equal(1);
        });

        it("then result.packages[0] is `package`", function() {
          expect(result.packages[0]).to.deep.equal(package);
        });

        it("then result.date is a Date", function() {
          expect(result.date).to.be.a("Date");
        });
      });


      describe("two objects with one nested objects", function() {
        var result, target;
        beforeEach(function() {
          target = {};
          result = Utils.merge(target, {"one": "dont"}, {"two": "twotest", "one": "onetest", "with": {"object": "two deep"}});
        });

        it("then result is target", function() {
          expect(result).to.equal(target);
        });

        it("then result is an object", function() {
          expect(result).to.be.an("object");
        });

        it("then result has three properties", function() {
          expect(Object.keys(result).length).to.equal(3);
        });

        it("then result.with is an object", function() {
          expect(result.with).to.be.an("object");
        });

        it("then result.with has one property", function() {
          expect(Object.keys(result.with).length).to.equal(1);
        });

        it("then result.with.object is 'two deep'", function() {
          expect(result.with.object).to.equal("two deep");
        });

        it("then result.one is a string", function() {
          expect(result.one).to.be.a("string");
        });

        it("then result.one is 'onetest'", function() {
          expect(result.one).to.equal("onetest");
        });

        it("then result.two is a string", function() {
          expect(result.two).to.be.a("string");
        });

        it("then result.two is 'twotest'", function() {
          expect(target.two).to.equal("twotest");
        });
      });

      describe("two objects with two nested objects", function() {
        var result, target;
        beforeEach(function() {
          target = {};
          result = Utils.merge(target, {"one": "dont"}, {"two": "twotest", "one": "onetest", "with": {"object": "two deep", "noway": {"yes":"way"}}});
        });

        it("then result is an object", function() {
          expect(result).to.be.an("object");
        });

        it("then result has three properties", function() {
          expect(Object.keys(result).length).to.equal(3);
        });

        it("then result.one is 'onetest'", function() {
          expect(result.one).to.equal("onetest");
        });

        it("then result.two is 'twotest'", function() {
          expect(result.two).to.equal("twotest");
        });

        it("then result.with is an object", function() {
          expect(result.with).to.be.an("object");
        });

        it("then result.with has two properties", function() {
          expect(Object.keys(result.with).length).to.equal(2);
        });

        it("then result.with.object is a string", function() {
          expect(result.with.object).to.be.a("string");
        });

        it("then result.with.object is 'two deep'", function() {
          expect(result.with.object).to.equal("two deep");
        });

        it("then result.with.noway is an object", function() {
          expect(result.with.noway).to.be.an("object");
        });

        it("then result.with.noway has 1 property", function() {
          expect(Object.keys(result.with.noway).length).to.equal(1);
        });

        it("then result.with.noway.yes is a string", function() {
          expect(result.with.noway.yes).to.be.a("string");
        });

        it("then result.with.noway.yes is 'way'", function() {
          expect(result.with.noway.yes).to.equal("way");
        });
      });


      describe("two objects with three deep nested objects", function() {
        var date, obj1, obj2, obj3, obj4, obj5, obj6, obj7, target;
        beforeEach(function() {
          date = new Date();
          obj1 = {"modules": {"no": {"item": "hello"}, "yes": {"item": date}}};
          obj2 = {"modules": {"no": {"item": "status1"}}};
          obj3 = {"modules": {"no": {"item": "overriden1"}}};
          obj4 = {"modules": {"no": {"item": "overriden2"}}};
          obj5 = {"modules": {"no": {"item": "overriden3"}}};
          obj6 = {"modules": {"no": {"item": "overriden4"}}};
          obj7 = {"modules": {"no": {"item": "overriden5"}}};
          target = Utils.merge({}, obj1, obj2, obj3, obj4, obj5, obj6, obj7);
        });

        it("then original obj1.no is an object", function() {
          expect(obj1.modules.no).to.be.an("object");
        });

        it("then original obj1.no.item is a string", function() {
          expect(obj1.modules.no.item).to.be.an("string");
        });

        it("then original obj1.no.item is 'hello'", function() {
          expect(obj1.modules.no.item).to.equal("hello");
        });

        it("then originl obj1.yes is an object", function() {
          expect(obj1.modules.yes).to.be.an("object");
        });

        it("then originl obj1.yes.item is a date", function() {
          expect(obj1.modules.yes.item).to.be.a("date");
        });

        it("then originl obj1.yes.item is " + date, function() {
          expect(obj1.modules.yes.item).to.equal(date);
        });

        it("then original obj2.no is an object", function() {
          expect(obj2.modules.no).to.be.an("object");
        });

        it("then original obj2.no.item is a string", function() {
          expect(obj2.modules.no.item).to.be.a("string");
        });

        it("then original obj2.no.item is 'status1'", function() {
          expect(obj2.modules.no.item).to.equal("status1");
        });

        it("then original obj3.no is an object", function() {
          expect(obj3.modules.no).to.be.an("object");
        });

        it("then original obj3.no.item is a string", function() {
          expect(obj3.modules.no.item).to.be.a("string");
        });

        it("then original obj3.no.item is 'overriden'", function() {
          expect(obj3.modules.no.item).to.equal("overriden1");
        });

        it("then original obj4.no is an object", function() {
          expect(obj4.modules.no).to.be.an("object");
        });

        it("then original obj4.no.item is a string", function() {
          expect(obj4.modules.no.item).to.be.a("string");
        });

        it("then original obj4.no.item is 'overriden'", function() {
          expect(obj4.modules.no.item).to.equal("overriden2");
        });

        it("then original obj5.no is an object", function() {
          expect(obj5.modules.no).to.be.an("object");
        });

        it("then original obj5.no.item is a string", function() {
          expect(obj5.modules.no.item).to.be.a("string");
        });

        it("then original obj5.no.item is 'overriden'", function() {
          expect(obj5.modules.no.item).to.equal("overriden3");
        });

        it("then original obj6.no is an object", function() {
          expect(obj6.modules.no).to.be.an("object");
        });

        it("then original obj6.no.item is a string", function() {
          expect(obj6.modules.no.item).to.be.a("string");
        });

        it("then original obj6.no.item is 'overriden'", function() {
          expect(obj6.modules.no.item).to.equal("overriden4");
        });

        it("then original obj7.no is an object", function() {
          expect(obj7.modules.no).to.be.an("object");
        });

        it("then original obj7.no.item is a string", function() {
          expect(obj7.modules.no.item).to.be.a("string");
        });

        it("then original obj7.no.item is 'overriden'", function() {
          expect(obj7.modules.no.item).to.equal("overriden5");
        });

        it("then result modules is an object", function() {
          expect(target.modules).to.be.an("object");
        });

        it("then result modules.no is an object", function() {
          expect(target.modules.no).to.be.an("object");
        });

        it("then result modules.no.item is overriden", function() {
          expect(target.modules.no.item).to.equal("overriden5");
        });

        it("then result module.yes is an object", function() {
          expect(target.modules.yes).to.be.an("object");
        });

        it("then result module.yes.item is a Date", function() {
          expect(target.modules.yes.item).to.be.a("date");
        });

        it("then result module.yes.item is", function() {
          expect(target.modules.yes.item).to.equal(date);
        });
      });
    });


    describe("when isRealObject", function() {
      describe("empty object", function() {
        it("is true", function() {
          expect(Utils.isPlainObject({})).to.equal(true);
        });
      });

      describe("null", function() {
        it("is false", function() {
          expect(Utils.isPlainObject(null)).to.equal(false);
        });
      });

      describe("new Date", function() {
        it("is false", function() {
          expect(Utils.isPlainObject(new Date())).to.equal(false);
        });
      });

      describe("undefined", function() {
        it("is false", function() {
          expect(Utils.isPlainObject(undefined)).to.equal(false);
        });
      });

      describe("anonymous function", function() {
        it("is false", function() {
          expect(Utils.isPlainObject(function(){})).to.equal(false);
        });
      });
    });


    describe("when isObject", function() {
      describe("empty object", function() {
        it("is true", function() {
          expect(Utils.isObject({})).to.equal(true);
        });
      });

      describe("null", function() {
        it("is true", function() {
          expect(Utils.isObject(null)).to.equal(true);
        });
      });

      describe("new Date", function() {
        it("is true", function() {
          expect(Utils.isObject(new Date())).to.equal(true);
        });
      });

      describe("undefined", function() {
        it("is false", function() {
          expect(Utils.isObject(undefined)).to.equal(false);
        });
      });

      describe("anonymous function", function() {
        it("is false", function() {
          expect(Utils.isObject(function(){})).to.equal(false);
        });
      });
    });


    describe("when isFunction", function() {
      describe("empty object", function() {
        it("is false", function() {
          expect(Utils.isFunction({})).to.equal(false);
        });
      });

      describe("null", function() {
        it("is false", function() {
          expect(Utils.isFunction(null)).to.equal(false);
        });
      });

      describe("new Date", function() {
        it("is false", function() {
          expect(Utils.isFunction(new Date())).to.equal(false);
        });
      });

      describe("undefined", function() {
        it("is false", function() {
          expect(Utils.isFunction(undefined)).to.equal(false);
        });
      });

      describe("anonymous function", function() {
        it("is true", function() {
          expect(Utils.isFunction(function(){})).to.equal(true);
        });
      });
    });

  });

});
