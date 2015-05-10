var matcher = require('./matcher');


/**
 * Provides functioanlity for aggregating matching rules that can
 * then be compared against a criteria to determine if the criteria
 * is met. The matching rules can be customized beyond simple string
 * comparison. Please take a look at {@link matchers}
 *
 * @class
 *
 * @param {Object} [options={}] - Settings for the rule to be created
 */
function Rule(options) {
  options = options || {};
  this._name  = Rule.configureName(options.name);
  this._match = Rule.configureMatch(options.match);
}


var ruleId = 0;

/**
 * Helper method to generate rule names.
 *
 * @returns {string} Name of the rule
 */
Rule.configureName = function(name) {
  return name || ('rule-' + ruleId++);
};


/**
 * Helper method to generate rules that can be executed to match criteria.
 *
 * @param {*} match - If match is a function, then we just call that function
 *  to do the comparison for us. Provide a function when looking to customize
 *  how criteria are matched to rules. If match is not a function, the rule
 *  matcher is used. The default rule matcher is generally sufficient. But if
 *  it is not, then provide a function.  Furthermore, match can be an array
 *  of matching rules.
 *
 * @returns {Array.<Rule>} array of configured rule matchers.
 */
Rule.configureMatch = function(match) {
  match = match || [];
  match = !(match instanceof Array) ? [match] : match;

  return match.map(function(item) {
    return (item && item.constructor === Function) ? item : matcher(item);
  });
};


/**
 * Method that returns the name of the rule
 *
 * @returns {string} Name of the rule
 */
Rule.prototype.getName = function() {
  return this._name;
};


Rule.prototype.getLength = function() {
  return this._match.length;
};


/**
 * Method to add a match to the list of matching rules
 *
 * @param {*} match - Matching rules to add. Can any type.
 *
 * @returns {Rule} this instance.
 */
Rule.prototype.addMatcher = function(match) {
  this._match = this._match.concat(Rule.configureMatch(match));
  return this;
};


/**
 * Method to match only *one* rule
 *
 * @param {string} criteria - Input to test against.
 *
 * @returns {boolean} True if any rule is matched, false otherwise
 */
Rule.prototype.match = Rule.prototype.matchAny = function(criteria) {
  var matches = this._match;
  var i, length;
  for (i = 0, length = matches.length; i < length; i++) {
    if (Rule.__match(matches[i], criteria)) {
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
    if (!Rule.__match(matches[i], criteria)) {
      return false;
    }
  }
  return true;
};


/**
 * Function that call the matcher with the criteria.
 *
 * @private
 * @returns {boolean}
 */
Rule.__match = function(match, criteria) {
  try {
    return match(criteria);
  }
  catch(ex) {
  }

  return false;
};


Rule.matcher = matcher;
module.exports = Rule;
