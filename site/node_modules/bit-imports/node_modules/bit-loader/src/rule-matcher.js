(function() {
  "use strict";

  var Utils     = require('./utils');
  var minimatch = require('minimatch');


  /**
   * Rule is a convenience class for encapsulating a rule name and
   * the match criteria to test against.
   *
   * @param {Object} [options={}] - Settings for the rule to be created
   */
  function Rule(options) {
    options = options || {};
    this.settings = options;
    this._name    = Rule.configureName(options.name);
    this._match   = Rule.configureMatch(options.match);
  }


  var ruleId = 0;

  /**
   * Helper method to generate rule names.
   *
   * @returns {string} Name of the rule
   */
  Rule.configureName = function(name) {
    return name || ("rule-" + ruleId++);
  };


  /**
   * Helper method to make sure matches are an array
   *
   * @returns {Array.<string>} Array of matching string
   */
  Rule.configureMatch = function(match) {
    match = match || [];
    return !(match instanceof Array) ? [match] : match;
  };


  /**
   * Method that returns the name of the rule
   *
   * @returns {string} Name of the rule
   */
  Rule.prototype.getName = function() {
    return this._name;
  };


  /**
   * Method to add a match to the list of matches
   *
   * @param {string | Array.<string>} match - String or collection of strings to match
   *   against.
   */
  Rule.prototype.addMatch = function(match) {
    match = Rule.configureMatch(match);
    this._match = this._match.concat(match);
  };


  /**
   * Method to match only one rule
   *
   * @param {string} criteria - Input to test against.
   *
   * @returns {boolean} True if any rule is matched, false otherwise
   */
  Rule.prototype.matchOne = function(criteria) {
    var matches = this._match;
    var i, length;
    for (i = 0, length = matches.length; i < length; i++) {
      if (this.matchCriteria(criteria, matches[i])) {
        return true;
      }
    }
    return false;
  };


  /**
   * Method to test againt *all* rules
   *
   * @param {string} criteria - Input to test against
   *
   * @returns {boolean} True is *all* rules match, false otherwise
   */
  Rule.prototype.matchAll = function(criteria) {
    var matches = this._match;
    var i, length;
    for (i = 0, length = matches.length; i < length; i++) {
      if (!this.matchCriteria(criteria, matches[i])) {
        return false;
      }
    }
    return true;
  };


  /**
   * Function that runs the rule matching logic
   */
  Rule.prototype.matchCriteria = function(criteria, match) {
    // Minimatch it!
    return minimatch(criteria, match);
  };


  /**
   * Rule matching engine
   */
  function RuleMatcher(config) {
    if (!(this instanceof RuleMatcher)) {
      return new RuleMatcher(config);
    }

    this._rules = {};

    if (config) {
      this.add(config);
    }
  }


  RuleMatcher.configureRule = function(config) {
    if (Utils.isString(config)) {
      config = {
        name: config
      };
    }
    else if (Utils.isArray(config)) {
      config = {
        match: config
      };
    }
    return config;
  };


  RuleMatcher.prototype.add = function(config) {
    config = RuleMatcher.configureRule(config);

    var rule = this.find(config.name);
    if (rule) {
      rule.addMatch(config.match);
    }
    else {
      rule = new Rule(config);
      this._rules[rule.getName()] = rule;
    }

    return rule;
  };


  RuleMatcher.prototype.all = function() {
    return this._rules;
  };


  RuleMatcher.prototype.find = function(ruleName) {
    return this._rules[ruleName];
  };


  RuleMatcher.prototype.filter = function(ruleNames) {
    var rules = {};
    for (var name in ruleNames) {
      if (this.hasRule(ruleNames[name])) {
        rules[name] = this.find(name);
      }
    }
    return rules;
  };


  RuleMatcher.prototype.getLength = function() {
    return Object.keys(this._rules).length;
  };


  RuleMatcher.prototype.match = function(criteria, ruleNames) {
    return typeof ruleNames === "string" ?
      this.matchOne(criteria, ruleNames) :
      this.matchAny(criteria, ruleNames);
  };


  RuleMatcher.prototype.matchOne = function(criteria, ruleName) {
    // Make sure the rule exists
    if (!this.hasRule(ruleName)) {
      return false;
    }

    var rule = this.find(ruleName);
    return rule && rule.matchOne(criteria);
  };


  RuleMatcher.prototype.matchAny = function(criteria, filter) {
    var rules = filter ? this.filter(filter) : this._rules;
    for (var ruleName in rules) {
      if (rules[ruleName] && rules[ruleName].matchOne(criteria)) {
        return true;
      }
    }
    return false;
  };


  RuleMatcher.prototype.matchAll = function(criteria, filter) {
    var rules = filter ? this.filter(filter) : this._rules;
    for (var ruleName in rules) {
      if (rules[ruleName] && !rules[ruleName].matchOne(criteria)) {
        return false;
      }
    }
    return true;
  };


  RuleMatcher.prototype.hasRule = function(ruleName) {
    return this._rules.hasOwnProperty(ruleName);
  };


  RuleMatcher.prototype.ensureRule = function(ruleName) {
    if (!this.hasRule(ruleName)) {
      throw new TypeError("Rule '" + ruleName + "' was not found");
    }
    return true;
  };


  module.exports = RuleMatcher;
})();
