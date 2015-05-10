define(["dist/index", "minimatch"], function(Rule, minimatch) {

  function minimatcher(match) {
    var mini = new minimatch.Minimatch(match);

    return function(criteria) {
      // When the criteria is not a string or the string is empty, we can just
      // return false to indicate that we don't have a match.
      if (criteria === "" || typeof(criteria) !== "string") {
        return false;
      }

      return mini.match(criteria);
    };
  }


  describe("Rule Suite", function() {
    var rule;
    beforeEach(function() {
      rule = new Rule({name: "transform"});
    });

    it("then the name of the rule is `transform`", function() {
      expect(rule.getName()).to.equal("transform");
    });


    describe("when the rule has a single match for `test.js`", function() {
      beforeEach(function() {
        rule.addMatcher("test.js");
      });

      it("then match for `test.js` is true", function() {
        expect(rule.match("test.js")).to.equal(true);
      });

      it("then match for `notfound.js` is false", function() {
        expect(rule.match("notfound.js")).to.equal(false);
      });

      it("then match for undefined is false", function() {
        expect(rule.match()).to.equal(false);
      });

      it("then match for true is false", function() {
        expect(rule.match(true)).to.equal(false);
      });

      it("then match for empty string is false", function() {
        expect(rule.match("")).to.equal(false);
      });
    });


    describe("when the rule is RegExp('\\.js$') for matching `.js` file extensions", function() {
      beforeEach(function() {
        rule.addMatcher(new RegExp("\\.js$"));
      });

      it("then match for `test.js` matches", function() {
         expect(rule.match("test.js")).to.equal(true);
      });

      it("then match for `test.jsx` does NOT match", function() {
         expect(rule.match("test.jsx")).to.equal(false);
      });

      it("then match for `test.js. does NOT match", function() {
        expect(rule.match("test.js.")).to.equal(false);
      });

      it("then match for `testjs` does NOT match", function() {
         expect(rule.match("testjs")).to.equal(false);
      });
    });


    describe("when the rule is a string to match extensions with `\\.js$`", function() {
      beforeEach(function() {
        rule.addMatcher(Rule.matcher.regex("\\.js$"));
      });

      it("then match for `test.js` matches", function() {
         expect(rule.match("test.js")).to.equal(true);
      });

      it("then match for `test.jsx` does NOT match", function() {
         expect(rule.match("test.jsx")).to.equal(false);
      });

      it("then match for `test.js. does NOT match", function() {
        expect(rule.match("test.js.")).to.equal(false);
      });

      it("then match for `testjs` does NOT match", function() {
         expect(rule.match("testjs")).to.equal(false);
      });
    });


    describe("when the rule is a string to match extensions with `/\\.js$/`", function() {
      beforeEach(function() {
        rule.addMatcher(/\.js$/);
      });

      it("then match for `test.js` matches", function() {
         expect(rule.match("test.js")).to.equal(true);
      });

      it("then match for `test.jsx` does NOT match", function() {
         expect(rule.match("test.jsx")).to.equal(false);
      });

      it("then match for `test.js. does NOT match", function() {
        expect(rule.match("test.js.")).to.equal(false);
      });

      it("then match for `testjs` does NOT match", function() {
         expect(rule.match("testjs")).to.equal(false);
      });
    });


    describe("when the rule is to match file extensions with built in matcher", function() {
      describe("and matching file extension `js`", function() {
        beforeEach(function() {
          rule.addMatcher(Rule.matcher.extension("js"));
        });

        it("then `test.js` matches", function() {
          expect(rule.match("test.js")).to.equal(true);
        });

        it("then `test.jsx` does NOT match", function() {
          expect(rule.match("test.jsx")).to.equal(false);
        });

        it("then `test.json` does NOT match", function() {
          expect(rule.match("test.json")).to.equal(false);
        });

        it("then match for `testjs` does NOT match", function() {
           expect(rule.match("testjs")).to.equal(false);
        });
      });

      describe("and matching file extension `js` and `jsx`", function() {
        beforeEach(function() {
          rule.addMatcher(Rule.matcher.extension("js|jsx"));
        });

        it("then `test.js` matches", function() {
          expect(rule.match("test.js")).to.equal(true);
        });

        it("then `test.jsx` matches", function() {
          expect(rule.match("test.jsx")).to.equal(true);
        });

        it("then `test.json` does NOT match", function() {
          expect(rule.match("test.json")).to.equal(false);
        });

        it("then match for `testjs` does NOT match", function() {
           expect(rule.match("testjs")).to.equal(false);
        });
      });

      describe("and matching file extension `js`, `jsx`, and `json`", function() {
        beforeEach(function() {
          rule.addMatcher(Rule.matcher.extension("js|jsx|json"));
        });

        it("then `test.js` matches", function() {
          expect(rule.match("test.js")).to.equal(true);
        });

        it("then `test.jsx` matches", function() {
          expect(rule.match("test.jsx")).to.equal(true);
        });

        it("then `test.json` matches", function() {
          expect(rule.match("test.json")).to.equal(true);
        });

        it("then `test.jso` does NOT match", function() {
          expect(rule.match("test.jso")).to.equal(false);
        });

        it("then match for `testjs` does NOT match", function() {
           expect(rule.match("testjs")).to.equal(false);
        });
      });
    });


    describe("when the rule has a custom rule to minimatch for `*.js`", function() {
      beforeEach(function() {
        rule.addMatcher(minimatcher("*.js"));
      });

      it("then match for `test.js` is true", function() {
        expect(rule.match("test.js")).to.equal(true);
      });

      it("then match for `some/path/test.js` is false", function() {
        expect(rule.match("some/path/test.js")).to.equal(false);
      });

      it("then match for `notfound.jsx` is false", function() {
        expect(rule.match("notfound.jsx")).to.equal(false);
      });
    });


    describe("when the rule has a custom rule to minimatch for `**/*.js`", function() {
      beforeEach(function() {
        rule.addMatcher(minimatcher("**/*.js"));
      });

      it("then match for `test.js` is true", function() {
        expect(rule.match("test.js")).to.equal(true);
      });

      it("then match for `some/path/test.js` is true", function() {
        expect(rule.match("some/path/test.js")).to.equal(true);
      });

      it("then match for `notfound.jsx` is false", function() {
        expect(rule.match("notfound.jsx")).to.equal(false);
      });
    });


    describe("when the rule has a custom rule to minimatch for `!**/*.js`", function() {
      beforeEach(function() {
        rule.addMatcher([minimatcher("!**/*.js")]);
      });

      it("then match for `test.js` is false", function() {
        expect(rule.match("test.js")).to.equal(false);
      });

      it("then match for `some/path/test.js` is false", function() {
        expect(rule.match("some/path/test.js")).to.equal(false);
      });

      it("then match for `found.jsx` is true", function() {
        expect(rule.match("found.jsx")).to.equal(true);
      });
    });


    describe("when the rule has two matches, `test1.js` and `test2.js`", function() {
      beforeEach(function() {
        rule.addMatcher(["test1.js", "test2.js"]);
      });

      it("then match for `test1.js` is true", function() {
        expect(rule.match("test1.js")).to.equal(true);
      });

      it("then match for `test2.js` is true", function() {
        expect(rule.match("test2.js")).to.equal(true);
      });

      it("then match for `notfound.js` is false", function() {
        expect(rule.match("notfound.js")).to.equal(false);
      });
    });


    describe("when checking if the criteria is a string", function() {
      beforeEach(function() {
        rule.addMatcher(Rule.matcher.string);
      });

      it("then match for `random string` is true", function() {
        expect(rule.match('random string')).to.equal(true);
      });

      it("then match for empty string is true", function() {
        expect(rule.match('')).to.equal(true);
      });

      it("then match for null is false", function() {
        expect(rule.match(null)).to.equal(false);
      });

      it("then match for a boolean value is false", function() {
        expect(rule.match(true)).to.equal(false);
      });

      it("then match for an object is false", function() {
        expect(rule.match({})).to.equal(false);
      });

      it("then match for a regexp is false", function() {
        expect(rule.match(/test/)).to.equal(false);
      });
    });

  });
});
