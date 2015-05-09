define(["dist/bit-loader"], function(Bitloader) {
  var RuleMatcher = Bitloader.RuleMatcher;

  describe("RuleMatcher Suite", function() {

    describe("When adding a single rule", function() {
      var matcher;
      beforeEach(function() {
        matcher = new RuleMatcher();
      });


      describe("and the rule added is a empty", function() {
        var rule;
        beforeEach(function() {
          rule = matcher.add({});
        });

        it("then the name of the rule is `rule-0`", function() {
          expect(rule.getName()).to.equal("rule-0");
        });
      });


      describe("and the rule added has name `transform`", function() {
        var rule;
        beforeEach(function() {
          rule = matcher.add({
            name: "transform"
          });
        });

        it("then the name of the rule is `transform`", function() {
          expect(rule.getName()).to.equal("transform");
        });
      });


      describe("and the rule has a single match for `test.js`", function() {
        beforeEach(function() {
          matcher.add({
            match: "test.js"
          });
        });

        it("then match for `test.js` is true", function() {
          expect(matcher.match("test.js")).to.equal(true);
        });

        it("then match for `notfound.js` is false", function() {
          expect(matcher.match("notfound.js")).to.equal(false);
        });
      });


      describe("and the rule has a single match for `*.js`", function() {
        beforeEach(function() {
          matcher.add({
            match: "*.js"
          });
        });

        it("then match for `test.js` is true", function() {
          expect(matcher.match("test.js")).to.equal(true);
        });

        it("then match for `some/path/test.js` is false", function() {
          expect(matcher.match("some/path/test.js")).to.equal(false);
        });

        it("then match for `notfound.jsx` is false", function() {
          expect(matcher.match("notfound.jsx")).to.equal(false);
        });
      });


      describe("and the rule has a single match for `**/*.js`", function() {
        beforeEach(function() {
          matcher.add({
            match: "**/*.js"
          });
        });

        it("then match for `test.js` is true", function() {
          expect(matcher.match("test.js")).to.equal(true);
        });

        it("then match for `some/path/test.js` is true", function() {
          expect(matcher.match("some/path/test.js")).to.equal(true);
        });

        it("then match for `notfound.jsx` is false", function() {
          expect(matcher.match("notfound.jsx")).to.equal(false);
        });
      });


      describe("and the rule has a single match for `!**/*.js`", function() {
        beforeEach(function() {
          matcher.add({
            match: "!**/*.js"
          });
        });

        it("then match for `test.js` is false", function() {
          expect(matcher.match("test.js")).to.equal(false);
        });

        it("then match for `some/path/test.js` is false", function() {
          expect(matcher.match("some/path/test.js")).to.equal(false);
        });

        it("then match for `found.jsx` is true", function() {
          expect(matcher.match("found.jsx")).to.equal(true);
        });
      });


      describe("and the rule has two matches, `test1.js` and `test2.js`", function() {
        beforeEach(function() {
          matcher.add({
            match: ["test1.js", "test2.js"]
          });
        });

        it("then match for `test1.js` is true", function() {
          expect(matcher.match("test1.js")).to.equal(true);
        });

        it("then match for `test2.js` is true", function() {
          expect(matcher.match("test2.js")).to.equal(true);
        });

        it("then match for `notfound.js` is false", function() {
          expect(matcher.match("notfound.js")).to.equal(false);
        });
      });


      describe("and the rule has name `transform` with match `test1.js` and `test2.js`", function() {
        beforeEach(function() {
          matcher.add({
            name: "transform",
            match: ["test1.js", "test2.js"]
          });
        });

        it("then match for `test1.js` is true for rule `transform`", function() {
          expect(matcher.match("test1.js", "transform")).to.equal(true);
        });

        it("then match for `test2.js` is true for any rule", function() {
          expect(matcher.match("test2.js")).to.equal(true);
        });

        it("then match for `test2.js` is false for rule `dependency` which does not exist", function() {
          expect(matcher.match("test2.js", "dependency")).to.equal(false);
        });

        it("then match for `notfound.js` is false", function() {
          expect(matcher.match("notfound.js")).to.equal(false);
        });
      });


      describe("and the rule has name `transform` with one match `test1.js` and later add `test2.js`", function() {
        beforeEach(function() {
          matcher.add({
            name: "transform",
            match: "test1.js"
          });

          matcher.add({
            name: "transform",
            match: "test2.js"
          });
        });

        it("then match for `test1.js` is true for rule `transform`", function() {
          expect(matcher.match("test1.js", "transform")).to.equal(true);
        });

        it("then match for `test2.js` is true for rule `transform`", function() {
          expect(matcher.match("test2.js", "transform")).to.equal(true);
        });

        it("then match for `test1.js` is true for any rule", function() {
          expect(matcher.match("test1.js")).to.equal(true);
        });

        it("then match for `test2.js` is true for any rule", function() {
          expect(matcher.match("test2.js")).to.equal(true);
        });

        it("then match for `test2.js` is false for rule `dependency` which does not exist", function() {
          expect(matcher.match("test2.js", "dependency")).to.equal(false);
        });

        it("then match for `notfound.js` is false", function() {
          expect(matcher.match("notfound.js")).to.equal(false);
        });
      });
    });

  });
});
