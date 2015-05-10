/**
 * Default matching rule with strict comparison. Or if the match is a regex
 * then the comparison is done by calling the `test` method on the regex.
 *
 * @param {*} match - If the input is a regex, then matches will be done using
 *  the regex itself. Otherwise, the comparison is done with strict comparison.
 *
 * @returns {boolean}
 */
function matcher(match) {
  if (match instanceof RegExp) {
    return function(criteria) {
      return match.test(criteria);
    };
  }

  return function(criteria) {
    return criteria === match;
  };
}


/**
 * Matcher for file extensions.
 *
 * @param {string} match - extensions to match. You can provide a pipe delimeted
 *  string to specify multiple extensions.  E.g. "js|jsx" will match js and jsx
 *  file extensions.
 *
 * @returns {function} Predicate that takes the criteria to match and returns
 *  true or false.
 */
matcher.extension = function(match) {
  if (match === '' || typeof match !== 'string') {
    throw new TypeError('Matching rule must be a string');
  }

  match = new RegExp('\\.(' + match + ')$');
  return function(criteria) {
    return match.test(criteria);
  };
};


/**
 * Matcher for strings. Use this to do strict comparison on strings.
 *
 * @param {string} match - String to match a criteria against.
 *
 * @returns {function} Predicate that takes the criteria to match and returns
 *  true or false.
 */
matcher.string = function(match) {
  if (typeof match !== 'string') {
    throw new TypeError('Match type must be a string');
  }

  return function(criteria) {
    return match === criteria;
  };
};


/**
 * Matcher for regex. Use this to create regex that can be used for matching
 * criteria.
 *
 * @param {string|RegExp} match - The input can be a string, which is converted
 *  to a regex. The input can also be a regex. This matcher will make sure we
 *  are working with regex matching rules.
 *
 * @returns {function} Predicate that takes the criteria to match and returns
 *  true or false.
 */
matcher.regex = function(match) {
  if (match !== '' && typeof match === 'string') {
    match = new RegExp(match);
  }

  if (!(match instanceof RegExp)) {
    throw new TypeError('Match type must be a string or a regex');
  }

  return function(criteria) {
    return match.test(criteria);
  };
};


module.exports = matcher;
