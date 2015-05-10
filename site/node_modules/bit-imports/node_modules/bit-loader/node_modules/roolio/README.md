[![Build Status](https://travis-ci.org/MiguelCastillo/roolio.svg?branch=travis-deployment)](https://travis-ci.org/MiguelCastillo/roolio)
[![Join the chat at https://gitter.im/MiguelCastillo/roolio](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/MiguelCastillo/roolio?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## roolio

> Composable rule matcher

Create rules to check if data matches a particular criteria. Rules are built with one or more `matcher`s so that you can compose sequences of `matcher`s to test data against. There are a few built in `matcher`s to get you started with, but you can create your own as well.


### matchers

Are functions that check if input data matches a criteria. For example, you can check if input data is a string, or if the string is all CAPS.

There are a few of these default matchers.


#### default

The default matcher will do a regex test if a regex is provided, otherwise it will do a strict equality comparison.

``` javascript
var rule = new Rule();

rule.addMatcher(['hello', /hola/]);

rule.match('hello');        // Will test true
rule.match('hola world');   // Will test true
rule.match('hello world');  // Will test false
rule.match('hi world');     // Will test false
```

#### extension

File extension matcher, which verifies if an input string has particular file extensions. You can specify one or more file extensions in a single matcher.

``` javascript
var rule = new Rule();

rule.addMatcher(Rule.matcher.extension('js|jsx|json'));

rule.match('test.js');   // Will test true
rule.match('test.jsx');  // Will test true
rule.match('test.json'); // Will test true
rule.match('testjs');    // Will test false
rule.match('test.js.a'); // Will test false
```

#### string

string matcher, which verifies if the input string matches one of the matching rules.

``` javascript
var rule = new Rule();

rule.addMatcher(Rule.matcher.string('test.js'));

rule.match('test.js');   // Will test true
rule.match('test.jsx');  // Will test false
rule.match('test.json'); // Will test false
rule.match('testjs');    // Will test false
rule.match('test.js.a'); // Will test false
```

You can actually just check if the input is a string.

``` javascript
var rule = new Rule();

rule.addMatcher(Rule.matcher.string);

rule.match('some randome string');   // Will test true
rule.match('');                      // Will test true
rule.match(true);                    // Will test false
rule.match(null);                    // Will test false
```

#### custom rule matchers

Rule matchers are just functions. So you can pass in your own functions if you want custom behavior. For example, you can create your own custom matcher to check objects properties.

Here is an arbitrary custom matcher that checks if the first letter of the input string is the same as the first letter of one of the matching rules:

``` javascript
function customMatcher(criteria) {
  return function(match) {
    return criteria[0] === match[0];
  };
}

var rule = new Rule();

rule.addMatcher([customMatcher('Standing up'), customMatcher('Dont stand up'));

rule.match('Some randome string');   // Will test true
rule.match('some randome string');   // Will test false
rule.match('Dance party');           // Will test true
rule.match('dance party');           // Will test false
```

### Rules API

#### addMatcher

Function that takes a single matching rule, or an array of them. Matching rules added with this method are aggregated, and returns itself to enable chaining.

``` javascript
var rule = new Rule();

rule
  .addMatcher(Rule.matcher.string)
  .addMatcher(/hello world/);
```

#### match || matchAny

Function that takes in data to be matched against the configured matching rules.  Returns whether or not the input matches **one** of the matching rules.

``` javascript
var rule = new Rule();

// Match is true
rule
  .addMatcher(Rule.matcher.string)
  .addMatcher(/hello world/);
  .match('test');
```

#### matchAll

Just like `match`, but it checks if the input matches **all** the matching rules.

``` javascript
var rule = new Rule();

// Match is false
rule
  .addMatcher(Rule.matcher.string)
  .addMatcher(/hello world/);
  .matchAll('test');

// Match is true
rule
  .matchAll('hello world');
```


#### getLength

Function that returns the number of matchers in a particular rule.

``` javascript
var rule = new Rule();

// Length returns 2
rule
  .addMatcher(Rule.matcher.string)
  .addMatcher(/hello world/)
  .getLength();
```

## License

Licensed under MIT
