(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.bitimports = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Acorn is a tiny, fast JavaScript parser written in JavaScript.
//
// Acorn was written by Marijn Haverbeke and various contributors and
// released under an MIT license. The Unicode regexps (for identifiers
// and whitespace) were taken from [Esprima](http://esprima.org) by
// Ariya Hidayat.
//
// Git repositories for Acorn are available at
//
//     http://marijnhaverbeke.nl/git/acorn
//     https://github.com/marijnh/acorn.git
//
// Please use the [github bug tracker][ghbt] to report issues.
//
// [ghbt]: https://github.com/marijnh/acorn/issues
//
// This file defines the main parser interface. The library also comes
// with a [error-tolerant parser][dammit] and an
// [abstract syntax tree walker][walk], defined in other files.
//
// [dammit]: acorn_loose.js
// [walk]: util/walk.js

(function(root, mod) {
  if (typeof exports == "object" && typeof module == "object") return mod(exports); // CommonJS
  if (typeof define == "function" && define.amd) return define(["exports"], mod); // AMD
  mod(root.acorn || (root.acorn = {})); // Plain browser env
})(this, function(exports) {
  "use strict";

  exports.version = "0.11.0";

  // The main exported interface (under `self.acorn` when in the
  // browser) is a `parse` function that takes a code string and
  // returns an abstract syntax tree as specified by [Mozilla parser
  // API][api], with the caveat that inline XML is not recognized.
  //
  // [api]: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API

  var options, input, inputLen, sourceFile;

  exports.parse = function(inpt, opts) {
    input = String(inpt); inputLen = input.length;
    setOptions(opts);
    initTokenState();
    var startPos = options.locations ? [tokPos, curPosition()] : tokPos;
    initParserState();
    return parseTopLevel(options.program || startNodeAt(startPos));
  };

  // A second optional argument can be given to further configure
  // the parser process. These options are recognized:

  var defaultOptions = exports.defaultOptions = {
    // `ecmaVersion` indicates the ECMAScript version to parse. Must
    // be either 3, or 5, or 6. This influences support for strict
    // mode, the set of reserved words, support for getters and
    // setters and other features.
    ecmaVersion: 5,
    // Turn on `strictSemicolons` to prevent the parser from doing
    // automatic semicolon insertion.
    strictSemicolons: false,
    // When `allowTrailingCommas` is false, the parser will not allow
    // trailing commas in array and object literals.
    allowTrailingCommas: true,
    // By default, reserved words are not enforced. Enable
    // `forbidReserved` to enforce them. When this option has the
    // value "everywhere", reserved words and keywords can also not be
    // used as property names.
    forbidReserved: false,
    // When enabled, a return at the top level is not considered an
    // error.
    allowReturnOutsideFunction: false,
    // When enabled, import/export statements are not constrained to
    // appearing at the top of the program.
    allowImportExportEverywhere: false,
    // When `locations` is on, `loc` properties holding objects with
    // `start` and `end` properties in `{line, column}` form (with
    // line being 1-based and column 0-based) will be attached to the
    // nodes.
    locations: false,
    // A function can be passed as `onToken` option, which will
    // cause Acorn to call that function with object in the same
    // format as tokenize() returns. Note that you are not
    // allowed to call the parser from the callback—that will
    // corrupt its internal state.
    onToken: null,
    // A function can be passed as `onComment` option, which will
    // cause Acorn to call that function with `(block, text, start,
    // end)` parameters whenever a comment is skipped. `block` is a
    // boolean indicating whether this is a block (`/* */`) comment,
    // `text` is the content of the comment, and `start` and `end` are
    // character offsets that denote the start and end of the comment.
    // When the `locations` option is on, two more parameters are
    // passed, the full `{line, column}` locations of the start and
    // end of the comments. Note that you are not allowed to call the
    // parser from the callback—that will corrupt its internal state.
    onComment: null,
    // Nodes have their start and end characters offsets recorded in
    // `start` and `end` properties (directly on the node, rather than
    // the `loc` object, which holds line/column data. To also add a
    // [semi-standardized][range] `range` property holding a `[start,
    // end]` array with the same numbers, set the `ranges` option to
    // `true`.
    //
    // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
    ranges: false,
    // It is possible to parse multiple files into a single AST by
    // passing the tree produced by parsing the first file as
    // `program` option in subsequent parses. This will add the
    // toplevel forms of the parsed file to the `Program` (top) node
    // of an existing parse tree.
    program: null,
    // When `locations` is on, you can pass this to record the source
    // file in every node's `loc` object.
    sourceFile: null,
    // This value, if given, is stored in every node, whether
    // `locations` is on or off.
    directSourceFile: null,
    // When enabled, parenthesized expressions are represented by
    // (non-standard) ParenthesizedExpression nodes
    preserveParens: false
  };

  // This function tries to parse a single expression at a given
  // offset in a string. Useful for parsing mixed-language formats
  // that embed JavaScript expressions.

  exports.parseExpressionAt = function(inpt, pos, opts) {
    input = String(inpt); inputLen = input.length;
    setOptions(opts);
    initTokenState(pos);
    initParserState();
    return parseExpression();
  };

  var isArray = function (obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
  };

  function setOptions(opts) {
    options = {};
    for (var opt in defaultOptions)
      options[opt] = opts && has(opts, opt) ? opts[opt] : defaultOptions[opt];
    sourceFile = options.sourceFile || null;
    if (isArray(options.onToken)) {
      var tokens = options.onToken;
      options.onToken = function (token) {
        tokens.push(token);
      };
    }
    if (isArray(options.onComment)) {
      var comments = options.onComment;
      options.onComment = function (block, text, start, end, startLoc, endLoc) {
        var comment = {
          type: block ? 'Block' : 'Line',
          value: text,
          start: start,
          end: end
        };
        if (options.locations) {
          comment.loc = new SourceLocation();
          comment.loc.start = startLoc;
          comment.loc.end = endLoc;
        }
        if (options.ranges)
          comment.range = [start, end];
        comments.push(comment);
      };
    }
    isKeyword = options.ecmaVersion >= 6 ? isEcma6Keyword : isEcma5AndLessKeyword;
  }

  // The `getLineInfo` function is mostly useful when the
  // `locations` option is off (for performance reasons) and you
  // want to find the line/column position for a given character
  // offset. `input` should be the code string that the offset refers
  // into.

  var getLineInfo = exports.getLineInfo = function(input, offset) {
    for (var line = 1, cur = 0;;) {
      lineBreak.lastIndex = cur;
      var match = lineBreak.exec(input);
      if (match && match.index < offset) {
        ++line;
        cur = match.index + match[0].length;
      } else break;
    }
    return {line: line, column: offset - cur};
  };

  function Token() {
    this.type = tokType;
    this.value = tokVal;
    this.start = tokStart;
    this.end = tokEnd;
    if (options.locations) {
      this.loc = new SourceLocation();
      this.loc.end = tokEndLoc;
      // TODO: remove in next major release
      this.startLoc = tokStartLoc;
      this.endLoc = tokEndLoc;
    }
    if (options.ranges)
      this.range = [tokStart, tokEnd];
  }

  exports.Token = Token;

  // Acorn is organized as a tokenizer and a recursive-descent parser.
  // The `tokenize` export provides an interface to the tokenizer.
  // Because the tokenizer is optimized for being efficiently used by
  // the Acorn parser itself, this interface is somewhat crude and not
  // very modular. Performing another parse or call to `tokenize` will
  // reset the internal state, and invalidate existing tokenizers.

  exports.tokenize = function(inpt, opts) {
    input = String(inpt); inputLen = input.length;
    setOptions(opts);
    initTokenState();
    skipSpace();

    function getToken(forceRegexp) {
      lastEnd = tokEnd;
      readToken(forceRegexp);
      return new Token();
    }
    getToken.jumpTo = function(pos, reAllowed) {
      tokPos = pos;
      if (options.locations) {
        tokCurLine = 1;
        tokLineStart = lineBreak.lastIndex = 0;
        var match;
        while ((match = lineBreak.exec(input)) && match.index < pos) {
          ++tokCurLine;
          tokLineStart = match.index + match[0].length;
        }
      }
      tokRegexpAllowed = reAllowed;
      skipSpace();
    };
    getToken.noRegexp = function() {
      tokRegexpAllowed = false;
    };
    getToken.options = options;
    return getToken;
  };

  // State is kept in (closure-)global variables. We already saw the
  // `options`, `input`, and `inputLen` variables above.

  // The current position of the tokenizer in the input.

  var tokPos;

  // The start and end offsets of the current token.

  var tokStart, tokEnd;

  // When `options.locations` is true, these hold objects
  // containing the tokens start and end line/column pairs.

  var tokStartLoc, tokEndLoc;

  // The type and value of the current token. Token types are objects,
  // named by variables against which they can be compared, and
  // holding properties that describe them (indicating, for example,
  // the precedence of an infix operator, and the original name of a
  // keyword token). The kind of value that's held in `tokVal` depends
  // on the type of the token. For literals, it is the literal value,
  // for operators, the operator name, and so on.

  var tokType, tokVal;

  // Internal state for the tokenizer. To distinguish between division
  // operators and regular expressions, it remembers whether the last
  // token was one that is allowed to be followed by an expression.
  // (If it is, a slash is probably a regexp, if it isn't it's a
  // division operator. See the `parseStatement` function for a
  // caveat.)

  var tokRegexpAllowed;

  // When `options.locations` is true, these are used to keep
  // track of the current line, and know when a new line has been
  // entered.

  var tokCurLine, tokLineStart;

  // These store the position of the previous token, which is useful
  // when finishing a node and assigning its `end` position.

  var lastStart, lastEnd, lastEndLoc;

  // This is the parser's state. `inFunction` is used to reject
  // `return` statements outside of functions, `inGenerator` to
  // reject `yield`s outside of generators, `labels` to verify
  // that `break` and `continue` have somewhere to jump to, and
  // `strict` indicates whether strict mode is on.

  var inFunction, inGenerator, labels, strict;

  // This counter is used for checking that arrow expressions did
  // not contain nested parentheses in argument list.

  var metParenL;

  // This is used by the tokenizer to track the template strings it is
  // inside, and count the amount of open braces seen inside them, to
  // be able to switch back to a template token when the } to match ${
  // is encountered. It will hold an array of integers.

  var templates;

  function initParserState() {
    lastStart = lastEnd = tokPos;
    if (options.locations) lastEndLoc = curPosition();
    inFunction = inGenerator = strict = false;
    labels = [];
    skipSpace();
    readToken();
  }

  // This function is used to raise exceptions on parse errors. It
  // takes an offset integer (into the current `input`) to indicate
  // the location of the error, attaches the position to the end
  // of the error message, and then raises a `SyntaxError` with that
  // message.

  function raise(pos, message) {
    var loc = getLineInfo(input, pos);
    message += " (" + loc.line + ":" + loc.column + ")";
    var err = new SyntaxError(message);
    err.pos = pos; err.loc = loc; err.raisedAt = tokPos;
    throw err;
  }

  // Reused empty array added for node fields that are always empty.

  var empty = [];

  // ## Token types

  // The assignment of fine-grained, information-carrying type objects
  // allows the tokenizer to store the information it has about a
  // token in a way that is very cheap for the parser to look up.

  // All token type variables start with an underscore, to make them
  // easy to recognize.

  // These are the general types. The `type` property is only used to
  // make them recognizeable when debugging.

  var _num = {type: "num"}, _regexp = {type: "regexp"}, _string = {type: "string"};
  var _name = {type: "name"}, _eof = {type: "eof"};

  // Keyword tokens. The `keyword` property (also used in keyword-like
  // operators) indicates that the token originated from an
  // identifier-like word, which is used when parsing property names.
  //
  // The `beforeExpr` property is used to disambiguate between regular
  // expressions and divisions. It is set on all token types that can
  // be followed by an expression (thus, a slash after them would be a
  // regular expression).
  //
  // `isLoop` marks a keyword as starting a loop, which is important
  // to know when parsing a label, in order to allow or disallow
  // continue jumps to that label.

  var _break = {keyword: "break"}, _case = {keyword: "case", beforeExpr: true}, _catch = {keyword: "catch"};
  var _continue = {keyword: "continue"}, _debugger = {keyword: "debugger"}, _default = {keyword: "default"};
  var _do = {keyword: "do", isLoop: true}, _else = {keyword: "else", beforeExpr: true};
  var _finally = {keyword: "finally"}, _for = {keyword: "for", isLoop: true}, _function = {keyword: "function"};
  var _if = {keyword: "if"}, _return = {keyword: "return", beforeExpr: true}, _switch = {keyword: "switch"};
  var _throw = {keyword: "throw", beforeExpr: true}, _try = {keyword: "try"}, _var = {keyword: "var"};
  var _let = {keyword: "let"}, _const = {keyword: "const"};
  var _while = {keyword: "while", isLoop: true}, _with = {keyword: "with"}, _new = {keyword: "new", beforeExpr: true};
  var _this = {keyword: "this"};
  var _class = {keyword: "class"}, _extends = {keyword: "extends", beforeExpr: true};
  var _export = {keyword: "export"}, _import = {keyword: "import"};
  var _yield = {keyword: "yield", beforeExpr: true};

  // The keywords that denote values.

  var _null = {keyword: "null", atomValue: null}, _true = {keyword: "true", atomValue: true};
  var _false = {keyword: "false", atomValue: false};

  // Some keywords are treated as regular operators. `in` sometimes
  // (when parsing `for`) needs to be tested against specifically, so
  // we assign a variable name to it for quick comparing.

  var _in = {keyword: "in", binop: 7, beforeExpr: true};

  // Map keyword names to token types.

  var keywordTypes = {"break": _break, "case": _case, "catch": _catch,
                      "continue": _continue, "debugger": _debugger, "default": _default,
                      "do": _do, "else": _else, "finally": _finally, "for": _for,
                      "function": _function, "if": _if, "return": _return, "switch": _switch,
                      "throw": _throw, "try": _try, "var": _var, "let": _let, "const": _const,
                      "while": _while, "with": _with,
                      "null": _null, "true": _true, "false": _false, "new": _new, "in": _in,
                      "instanceof": {keyword: "instanceof", binop: 7, beforeExpr: true}, "this": _this,
                      "typeof": {keyword: "typeof", prefix: true, beforeExpr: true},
                      "void": {keyword: "void", prefix: true, beforeExpr: true},
                      "delete": {keyword: "delete", prefix: true, beforeExpr: true},
                      "class": _class, "extends": _extends,
                      "export": _export, "import": _import, "yield": _yield};

  // Punctuation token types. Again, the `type` property is purely for debugging.

  var _bracketL = {type: "[", beforeExpr: true}, _bracketR = {type: "]"}, _braceL = {type: "{", beforeExpr: true};
  var _braceR = {type: "}"}, _parenL = {type: "(", beforeExpr: true}, _parenR = {type: ")"};
  var _comma = {type: ",", beforeExpr: true}, _semi = {type: ";", beforeExpr: true};
  var _colon = {type: ":", beforeExpr: true}, _dot = {type: "."}, _question = {type: "?", beforeExpr: true};
  var _arrow = {type: "=>", beforeExpr: true}, _template = {type: "template"}, _templateContinued = {type: "templateContinued"};
  var _ellipsis = {type: "...", prefix: true, beforeExpr: true};

  // Operators. These carry several kinds of properties to help the
  // parser use them properly (the presence of these properties is
  // what categorizes them as operators).
  //
  // `binop`, when present, specifies that this operator is a binary
  // operator, and will refer to its precedence.
  //
  // `prefix` and `postfix` mark the operator as a prefix or postfix
  // unary operator. `isUpdate` specifies that the node produced by
  // the operator should be of type UpdateExpression rather than
  // simply UnaryExpression (`++` and `--`).
  //
  // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
  // binary operators with a very low precedence, that should result
  // in AssignmentExpression nodes.

  var _slash = {binop: 10, beforeExpr: true}, _eq = {isAssign: true, beforeExpr: true};
  var _assign = {isAssign: true, beforeExpr: true};
  var _incDec = {postfix: true, prefix: true, isUpdate: true}, _prefix = {prefix: true, beforeExpr: true};
  var _logicalOR = {binop: 1, beforeExpr: true};
  var _logicalAND = {binop: 2, beforeExpr: true};
  var _bitwiseOR = {binop: 3, beforeExpr: true};
  var _bitwiseXOR = {binop: 4, beforeExpr: true};
  var _bitwiseAND = {binop: 5, beforeExpr: true};
  var _equality = {binop: 6, beforeExpr: true};
  var _relational = {binop: 7, beforeExpr: true};
  var _bitShift = {binop: 8, beforeExpr: true};
  var _plusMin = {binop: 9, prefix: true, beforeExpr: true};
  var _modulo = {binop: 10, beforeExpr: true};

  // '*' may be multiply or have special meaning in ES6
  var _star = {binop: 10, beforeExpr: true};

  // Provide access to the token types for external users of the
  // tokenizer.

  exports.tokTypes = {bracketL: _bracketL, bracketR: _bracketR, braceL: _braceL, braceR: _braceR,
                      parenL: _parenL, parenR: _parenR, comma: _comma, semi: _semi, colon: _colon,
                      dot: _dot, ellipsis: _ellipsis, question: _question, slash: _slash, eq: _eq,
                      name: _name, eof: _eof, num: _num, regexp: _regexp, string: _string,
                      arrow: _arrow, template: _template, templateContinued: _templateContinued, star: _star,
                      assign: _assign};
  for (var kw in keywordTypes) exports.tokTypes["_" + kw] = keywordTypes[kw];

  // This is a trick taken from Esprima. It turns out that, on
  // non-Chrome browsers, to check whether a string is in a set, a
  // predicate containing a big ugly `switch` statement is faster than
  // a regular expression, and on Chrome the two are about on par.
  // This function uses `eval` (non-lexical) to produce such a
  // predicate from a space-separated string of words.
  //
  // It starts by sorting the words by length.

  function makePredicate(words) {
    words = words.split(" ");
    var f = "", cats = [];
    out: for (var i = 0; i < words.length; ++i) {
      for (var j = 0; j < cats.length; ++j)
        if (cats[j][0].length == words[i].length) {
          cats[j].push(words[i]);
          continue out;
        }
      cats.push([words[i]]);
    }
    function compareTo(arr) {
      if (arr.length == 1) return f += "return str === " + JSON.stringify(arr[0]) + ";";
      f += "switch(str){";
      for (var i = 0; i < arr.length; ++i) f += "case " + JSON.stringify(arr[i]) + ":";
      f += "return true}return false;";
    }

    // When there are more than three length categories, an outer
    // switch first dispatches on the lengths, to save on comparisons.

    if (cats.length > 3) {
      cats.sort(function(a, b) {return b.length - a.length;});
      f += "switch(str.length){";
      for (var i = 0; i < cats.length; ++i) {
        var cat = cats[i];
        f += "case " + cat[0].length + ":";
        compareTo(cat);
      }
      f += "}";

    // Otherwise, simply generate a flat `switch` statement.

    } else {
      compareTo(words);
    }
    return new Function("str", f);
  }

  // The ECMAScript 3 reserved word list.

  var isReservedWord3 = makePredicate("abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile");

  // ECMAScript 5 reserved words.

  var isReservedWord5 = makePredicate("class enum extends super const export import");

  // The additional reserved words in strict mode.

  var isStrictReservedWord = makePredicate("implements interface let package private protected public static yield");

  // The forbidden variable names in strict mode.

  var isStrictBadIdWord = makePredicate("eval arguments");

  // And the keywords.

  var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";

  var isEcma5AndLessKeyword = makePredicate(ecma5AndLessKeywords);

  var isEcma6Keyword = makePredicate(ecma5AndLessKeywords + " let const class extends export import yield");

  var isKeyword = isEcma5AndLessKeyword;

  // ## Character categories

  // Big ugly regular expressions that match characters in the
  // whitespace, identifier, and identifier-start categories. These
  // are only applied when a character is found to actually have a
  // code point above 128.
  // Generated by `tools/generate-identifier-regex.js`.

  var nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/;
  var nonASCIIidentifierStartChars = "\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B2\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC";
  var nonASCIIidentifierChars = "\u0300-\u036F\u0483-\u0487\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u0669\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u06F0-\u06F9\u0711\u0730-\u074A\u07A6-\u07B0\u07C0-\u07C9\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E4-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0966-\u096F\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u09E6-\u09EF\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A66-\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B66-\u0B6F\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0CE6-\u0CEF\u0D01-\u0D03\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D66-\u0D6F\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0E50-\u0E59\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0ED0-\u0ED9\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1040-\u1049\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u18A9\u1920-\u192B\u1930-\u193B\u1946-\u194F\u19B0-\u19C0\u19C8\u19C9\u19D0-\u19D9\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AB0-\u1ABD\u1B00-\u1B04\u1B34-\u1B44\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BF3\u1C24-\u1C37\u1C40-\u1C49\u1C50-\u1C59\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF5\u1DFC-\u1DFF\u200C\u200D\u203F\u2040\u2054\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA620-\uA629\uA66F\uA674-\uA67D\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F1\uA900-\uA909\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9D0-\uA9D9\uA9E5\uA9F0-\uA9F9\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA50-\uAA59\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uABF0-\uABF9\uFB1E\uFE00-\uFE0F\uFE20-\uFE2D\uFE33\uFE34\uFE4D-\uFE4F\uFF10-\uFF19\uFF3F";
  var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
  var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

  // Whether a single character denotes a newline.

  var newline = /[\n\r\u2028\u2029]/;

  function isNewLine(code) {
    return code === 10 || code === 13 || code === 0x2028 || code == 0x2029;
  }

  // Matches a whole line break (where CRLF is considered a single
  // line break). Used to count lines.

  var lineBreak = /\r\n|[\n\r\u2028\u2029]/g;

  // Test whether a given character code starts an identifier.

  var isIdentifierStart = exports.isIdentifierStart = function(code) {
    if (code < 65) return code === 36;
    if (code < 91) return true;
    if (code < 97) return code === 95;
    if (code < 123)return true;
    return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code));
  };

  // Test whether a given character is part of an identifier.

  var isIdentifierChar = exports.isIdentifierChar = function(code) {
    if (code < 48) return code === 36;
    if (code < 58) return true;
    if (code < 65) return false;
    if (code < 91) return true;
    if (code < 97) return code === 95;
    if (code < 123)return true;
    return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code));
  };

  // ## Tokenizer

  // These are used when `options.locations` is on, for the
  // `tokStartLoc` and `tokEndLoc` properties.

  function Position(line, col) {
    this.line = line;
    this.column = col;
  }

  Position.prototype.offset = function(n) {
    return new Position(this.line, this.column + n);
  }

  function curPosition() {
    return new Position(tokCurLine, tokPos - tokLineStart);
  }

  // Reset the token state. Used at the start of a parse.

  function initTokenState(pos) {
    if (pos) {
      tokPos = pos;
      tokLineStart = Math.max(0, input.lastIndexOf("\n", pos));
      tokCurLine = input.slice(0, tokLineStart).split(newline).length;
    } else {
      tokCurLine = 1;
      tokPos = tokLineStart = 0;
    }
    tokRegexpAllowed = true;
    metParenL = 0;
    templates = [];
  }

  // Called at the end of every token. Sets `tokEnd`, `tokVal`, and
  // `tokRegexpAllowed`, and skips the space after the token, so that
  // the next one's `tokStart` will point at the right position.

  function finishToken(type, val, shouldSkipSpace) {
    tokEnd = tokPos;
    if (options.locations) tokEndLoc = curPosition();
    tokType = type;
    if (shouldSkipSpace !== false) skipSpace();
    tokVal = val;
    tokRegexpAllowed = type.beforeExpr;
    if (options.onToken) {
      options.onToken(new Token());
    }
  }

  function skipBlockComment() {
    var startLoc = options.onComment && options.locations && curPosition();
    var start = tokPos, end = input.indexOf("*/", tokPos += 2);
    if (end === -1) raise(tokPos - 2, "Unterminated comment");
    tokPos = end + 2;
    if (options.locations) {
      lineBreak.lastIndex = start;
      var match;
      while ((match = lineBreak.exec(input)) && match.index < tokPos) {
        ++tokCurLine;
        tokLineStart = match.index + match[0].length;
      }
    }
    if (options.onComment)
      options.onComment(true, input.slice(start + 2, end), start, tokPos,
                        startLoc, options.locations && curPosition());
  }

  function skipLineComment(startSkip) {
    var start = tokPos;
    var startLoc = options.onComment && options.locations && curPosition();
    var ch = input.charCodeAt(tokPos+=startSkip);
    while (tokPos < inputLen && ch !== 10 && ch !== 13 && ch !== 8232 && ch !== 8233) {
      ++tokPos;
      ch = input.charCodeAt(tokPos);
    }
    if (options.onComment)
      options.onComment(false, input.slice(start + startSkip, tokPos), start, tokPos,
                        startLoc, options.locations && curPosition());
  }

  // Called at the start of the parse and after every token. Skips
  // whitespace and comments, and.

  function skipSpace() {
    while (tokPos < inputLen) {
      var ch = input.charCodeAt(tokPos);
      if (ch === 32) { // ' '
        ++tokPos;
      } else if (ch === 13) {
        ++tokPos;
        var next = input.charCodeAt(tokPos);
        if (next === 10) {
          ++tokPos;
        }
        if (options.locations) {
          ++tokCurLine;
          tokLineStart = tokPos;
        }
      } else if (ch === 10 || ch === 8232 || ch === 8233) {
        ++tokPos;
        if (options.locations) {
          ++tokCurLine;
          tokLineStart = tokPos;
        }
      } else if (ch > 8 && ch < 14) {
        ++tokPos;
      } else if (ch === 47) { // '/'
        var next = input.charCodeAt(tokPos + 1);
        if (next === 42) { // '*'
          skipBlockComment();
        } else if (next === 47) { // '/'
          skipLineComment(2);
        } else break;
      } else if (ch === 160) { // '\xa0'
        ++tokPos;
      } else if (ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
        ++tokPos;
      } else {
        break;
      }
    }
  }

  // ### Token reading

  // This is the function that is called to fetch the next token. It
  // is somewhat obscure, because it works in character codes rather
  // than characters, and because operator parsing has been inlined
  // into it.
  //
  // All in the name of speed.
  //
  // The `forceRegexp` parameter is used in the one case where the
  // `tokRegexpAllowed` trick does not work. See `parseStatement`.

  function readToken_dot() {
    var next = input.charCodeAt(tokPos + 1);
    if (next >= 48 && next <= 57) return readNumber(true);
    var next2 = input.charCodeAt(tokPos + 2);
    if (options.ecmaVersion >= 6 && next === 46 && next2 === 46) { // 46 = dot '.'
      tokPos += 3;
      return finishToken(_ellipsis);
    } else {
      ++tokPos;
      return finishToken(_dot);
    }
  }

  function readToken_slash() { // '/'
    var next = input.charCodeAt(tokPos + 1);
    if (tokRegexpAllowed) {++tokPos; return readRegexp();}
    if (next === 61) return finishOp(_assign, 2);
    return finishOp(_slash, 1);
  }

  function readToken_mult_modulo(code) { // '%*'
    var next = input.charCodeAt(tokPos + 1);
    if (next === 61) return finishOp(_assign, 2);
    return finishOp(code === 42 ? _star : _modulo, 1);
  }

  function readToken_pipe_amp(code) { // '|&'
    var next = input.charCodeAt(tokPos + 1);
    if (next === code) return finishOp(code === 124 ? _logicalOR : _logicalAND, 2);
    if (next === 61) return finishOp(_assign, 2);
    return finishOp(code === 124 ? _bitwiseOR : _bitwiseAND, 1);
  }

  function readToken_caret() { // '^'
    var next = input.charCodeAt(tokPos + 1);
    if (next === 61) return finishOp(_assign, 2);
    return finishOp(_bitwiseXOR, 1);
  }

  function readToken_plus_min(code) { // '+-'
    var next = input.charCodeAt(tokPos + 1);
    if (next === code) {
      if (next == 45 && input.charCodeAt(tokPos + 2) == 62 &&
          newline.test(input.slice(lastEnd, tokPos))) {
        // A `-->` line comment
        skipLineComment(3);
        skipSpace();
        return readToken();
      }
      return finishOp(_incDec, 2);
    }
    if (next === 61) return finishOp(_assign, 2);
    return finishOp(_plusMin, 1);
  }

  function readToken_lt_gt(code) { // '<>'
    var next = input.charCodeAt(tokPos + 1);
    var size = 1;
    if (next === code) {
      size = code === 62 && input.charCodeAt(tokPos + 2) === 62 ? 3 : 2;
      if (input.charCodeAt(tokPos + size) === 61) return finishOp(_assign, size + 1);
      return finishOp(_bitShift, size);
    }
    if (next == 33 && code == 60 && input.charCodeAt(tokPos + 2) == 45 &&
        input.charCodeAt(tokPos + 3) == 45) {
      // `<!--`, an XML-style comment that should be interpreted as a line comment
      skipLineComment(4);
      skipSpace();
      return readToken();
    }
    if (next === 61)
      size = input.charCodeAt(tokPos + 2) === 61 ? 3 : 2;
    return finishOp(_relational, size);
  }

  function readToken_eq_excl(code) { // '=!', '=>'
    var next = input.charCodeAt(tokPos + 1);
    if (next === 61) return finishOp(_equality, input.charCodeAt(tokPos + 2) === 61 ? 3 : 2);
    if (code === 61 && next === 62 && options.ecmaVersion >= 6) { // '=>'
      tokPos += 2;
      return finishToken(_arrow);
    }
    return finishOp(code === 61 ? _eq : _prefix, 1);
  }

  function getTokenFromCode(code) {
    switch (code) {
    // The interpretation of a dot depends on whether it is followed
    // by a digit or another two dots.
    case 46: // '.'
      return readToken_dot();

    // Punctuation tokens.
    case 40: ++tokPos; return finishToken(_parenL);
    case 41: ++tokPos; return finishToken(_parenR);
    case 59: ++tokPos; return finishToken(_semi);
    case 44: ++tokPos; return finishToken(_comma);
    case 91: ++tokPos; return finishToken(_bracketL);
    case 93: ++tokPos; return finishToken(_bracketR);
    case 123:
      ++tokPos;
      if (templates.length) ++templates[templates.length - 1];
      return finishToken(_braceL);
    case 125:
      ++tokPos;
      if (templates.length && --templates[templates.length - 1] === 0)
        return readTemplateString(_templateContinued);
      else
        return finishToken(_braceR);
    case 58: ++tokPos; return finishToken(_colon);
    case 63: ++tokPos; return finishToken(_question);

    case 96: // '`'
      if (options.ecmaVersion >= 6) {
        ++tokPos;
        return readTemplateString(_template);
      }

    case 48: // '0'
      var next = input.charCodeAt(tokPos + 1);
      if (next === 120 || next === 88) return readRadixNumber(16); // '0x', '0X' - hex number
      if (options.ecmaVersion >= 6) {
        if (next === 111 || next === 79) return readRadixNumber(8); // '0o', '0O' - octal number
        if (next === 98 || next === 66) return readRadixNumber(2); // '0b', '0B' - binary number
      }
    // Anything else beginning with a digit is an integer, octal
    // number, or float.
    case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: // 1-9
      return readNumber(false);

    // Quotes produce strings.
    case 34: case 39: // '"', "'"
      return readString(code);

    // Operators are parsed inline in tiny state machines. '=' (61) is
    // often referred to. `finishOp` simply skips the amount of
    // characters it is given as second argument, and returns a token
    // of the type given by its first argument.

    case 47: // '/'
      return readToken_slash();

    case 37: case 42: // '%*'
      return readToken_mult_modulo(code);

    case 124: case 38: // '|&'
      return readToken_pipe_amp(code);

    case 94: // '^'
      return readToken_caret();

    case 43: case 45: // '+-'
      return readToken_plus_min(code);

    case 60: case 62: // '<>'
      return readToken_lt_gt(code);

    case 61: case 33: // '=!'
      return readToken_eq_excl(code);

    case 126: // '~'
      return finishOp(_prefix, 1);
    }

    return false;
  }

  function readToken(forceRegexp) {
    if (!forceRegexp) tokStart = tokPos;
    else tokPos = tokStart + 1;
    if (options.locations) tokStartLoc = curPosition();
    if (forceRegexp) return readRegexp();
    if (tokPos >= inputLen) return finishToken(_eof);

    var code = input.charCodeAt(tokPos);

    // Identifier or keyword. '\uXXXX' sequences are allowed in
    // identifiers, so '\' also dispatches to that.
    if (isIdentifierStart(code) || code === 92 /* '\' */) return readWord();

    var tok = getTokenFromCode(code);

    if (tok === false) {
      // If we are here, we either found a non-ASCII identifier
      // character, or something that's entirely disallowed.
      var ch = String.fromCharCode(code);
      if (ch === "\\" || nonASCIIidentifierStart.test(ch)) return readWord();
      raise(tokPos, "Unexpected character '" + ch + "'");
    }
    return tok;
  }

  function finishOp(type, size) {
    var str = input.slice(tokPos, tokPos + size);
    tokPos += size;
    finishToken(type, str);
  }

  var regexpUnicodeSupport = false;
  try { new RegExp("\uffff", "u"); regexpUnicodeSupport = true; }
  catch(e) {}

  // Parse a regular expression. Some context-awareness is necessary,
  // since a '/' inside a '[]' set does not end the expression.

  function readRegexp() {
    var content = "", escaped, inClass, start = tokPos;
    for (;;) {
      if (tokPos >= inputLen) raise(start, "Unterminated regular expression");
      var ch = input.charAt(tokPos);
      if (newline.test(ch)) raise(start, "Unterminated regular expression");
      if (!escaped) {
        if (ch === "[") inClass = true;
        else if (ch === "]" && inClass) inClass = false;
        else if (ch === "/" && !inClass) break;
        escaped = ch === "\\";
      } else escaped = false;
      ++tokPos;
    }
    var content = input.slice(start, tokPos);
    ++tokPos;
    // Need to use `readWord1` because '\uXXXX' sequences are allowed
    // here (don't ask).
    var mods = readWord1();
    var tmp = content;
    if (mods) {
      var validFlags = /^[gmsiy]*$/;
      if (options.ecmaVersion >= 6) validFlags = /^[gmsiyu]*$/;
      if (!validFlags.test(mods)) raise(start, "Invalid regular expression flag");
      if (mods.indexOf('u') >= 0 && !regexpUnicodeSupport) {
        // Replace each astral symbol and every Unicode code point
        // escape sequence that represents such a symbol with a single
        // ASCII symbol to avoid throwing on regular expressions that
        // are only valid in combination with the `/u` flag.
        tmp = tmp
          .replace(/\\u\{([0-9a-fA-F]{5,6})\}/g, "x")
          .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "x");
      }
    }
    // Detect invalid regular expressions.
    try {
      new RegExp(tmp);
    } catch (e) {
      if (e instanceof SyntaxError) raise(start, "Error parsing regular expression: " + e.message);
      raise(e);
    }
    // Get a regular expression object for this pattern-flag pair, or `null` in
    // case the current environment doesn't support the flags it uses.
    try {
      var value = new RegExp(content, mods);
    } catch (err) {
      value = null;
    }
    return finishToken(_regexp, {pattern: content, flags: mods, value: value});
  }

  // Read an integer in the given radix. Return null if zero digits
  // were read, the integer value otherwise. When `len` is given, this
  // will return `null` unless the integer has exactly `len` digits.

  function readInt(radix, len) {
    var start = tokPos, total = 0;
    for (var i = 0, e = len == null ? Infinity : len; i < e; ++i) {
      var code = input.charCodeAt(tokPos), val;
      if (code >= 97) val = code - 97 + 10; // a
      else if (code >= 65) val = code - 65 + 10; // A
      else if (code >= 48 && code <= 57) val = code - 48; // 0-9
      else val = Infinity;
      if (val >= radix) break;
      ++tokPos;
      total = total * radix + val;
    }
    if (tokPos === start || len != null && tokPos - start !== len) return null;

    return total;
  }

  function readRadixNumber(radix) {
    tokPos += 2; // 0x
    var val = readInt(radix);
    if (val == null) raise(tokStart + 2, "Expected number in radix " + radix);
    if (isIdentifierStart(input.charCodeAt(tokPos))) raise(tokPos, "Identifier directly after number");
    return finishToken(_num, val);
  }

  // Read an integer, octal integer, or floating-point number.

  function readNumber(startsWithDot) {
    var start = tokPos, isFloat = false, octal = input.charCodeAt(tokPos) === 48;
    if (!startsWithDot && readInt(10) === null) raise(start, "Invalid number");
    if (input.charCodeAt(tokPos) === 46) {
      ++tokPos;
      readInt(10);
      isFloat = true;
    }
    var next = input.charCodeAt(tokPos);
    if (next === 69 || next === 101) { // 'eE'
      next = input.charCodeAt(++tokPos);
      if (next === 43 || next === 45) ++tokPos; // '+-'
      if (readInt(10) === null) raise(start, "Invalid number");
      isFloat = true;
    }
    if (isIdentifierStart(input.charCodeAt(tokPos))) raise(tokPos, "Identifier directly after number");

    var str = input.slice(start, tokPos), val;
    if (isFloat) val = parseFloat(str);
    else if (!octal || str.length === 1) val = parseInt(str, 10);
    else if (/[89]/.test(str) || strict) raise(start, "Invalid number");
    else val = parseInt(str, 8);
    return finishToken(_num, val);
  }

  // Read a string value, interpreting backslash-escapes.

  function readCodePoint() {
    var ch = input.charCodeAt(tokPos), code;

    if (ch === 123) {
      if (options.ecmaVersion < 6) unexpected();
      ++tokPos;
      code = readHexChar(input.indexOf('}', tokPos) - tokPos);
      ++tokPos;
      if (code > 0x10FFFF) unexpected();
    } else {
      code = readHexChar(4);
    }

    // UTF-16 Encoding
    if (code <= 0xFFFF) {
      return String.fromCharCode(code);
    }
    var cu1 = ((code - 0x10000) >> 10) + 0xD800;
    var cu2 = ((code - 0x10000) & 1023) + 0xDC00;
    return String.fromCharCode(cu1, cu2);
  }

  function readString(quote) {
    ++tokPos;
    var out = "";
    for (;;) {
      if (tokPos >= inputLen) raise(tokStart, "Unterminated string constant");
      var ch = input.charCodeAt(tokPos);
      if (ch === quote) {
        ++tokPos;
        return finishToken(_string, out);
      }
      if (ch === 92) { // '\'
        out += readEscapedChar();
      } else {
        ++tokPos;
        if (newline.test(String.fromCharCode(ch))) {
          raise(tokStart, "Unterminated string constant");
        }
        out += String.fromCharCode(ch); // '\'
      }
    }
  }

  function readTemplateString(type) {
    if (type == _templateContinued) templates.pop();
    var out = "", start = tokPos;;
    for (;;) {
      if (tokPos >= inputLen) raise(tokStart, "Unterminated template");
      var ch = input.charAt(tokPos);
      if (ch === "`" || ch === "$" && input.charCodeAt(tokPos + 1) === 123) { // '`', '${'
        var raw = input.slice(start, tokPos);
        ++tokPos;
        if (ch == "$") { ++tokPos; templates.push(1); }
        return finishToken(type, {cooked: out, raw: raw});
      }

      if (ch === "\\") { // '\'
        out += readEscapedChar();
      } else {
        ++tokPos;
        if (newline.test(ch)) {
          if (ch === "\r" && input.charCodeAt(tokPos) === 10) {
            ++tokPos;
            ch = "\n";
          }
          if (options.locations) {
            ++tokCurLine;
            tokLineStart = tokPos;
          }
        }
        out += ch;
      }
    }
  }

  // Used to read escaped characters

  function readEscapedChar() {
    var ch = input.charCodeAt(++tokPos);
    var octal = /^[0-7]+/.exec(input.slice(tokPos, tokPos + 3));
    if (octal) octal = octal[0];
    while (octal && parseInt(octal, 8) > 255) octal = octal.slice(0, -1);
    if (octal === "0") octal = null;
    ++tokPos;
    if (octal) {
      if (strict) raise(tokPos - 2, "Octal literal in strict mode");
      tokPos += octal.length - 1;
      return String.fromCharCode(parseInt(octal, 8));
    } else {
      switch (ch) {
        case 110: return "\n"; // 'n' -> '\n'
        case 114: return "\r"; // 'r' -> '\r'
        case 120: return String.fromCharCode(readHexChar(2)); // 'x'
        case 117: return readCodePoint(); // 'u'
        case 116: return "\t"; // 't' -> '\t'
        case 98: return "\b"; // 'b' -> '\b'
        case 118: return "\u000b"; // 'v' -> '\u000b'
        case 102: return "\f"; // 'f' -> '\f'
        case 48: return "\0"; // 0 -> '\0'
        case 13: if (input.charCodeAt(tokPos) === 10) ++tokPos; // '\r\n'
        case 10: // ' \n'
          if (options.locations) { tokLineStart = tokPos; ++tokCurLine; }
          return "";
        default: return String.fromCharCode(ch);
      }
    }
  }

  // Used to read character escape sequences ('\x', '\u', '\U').

  function readHexChar(len) {
    var n = readInt(16, len);
    if (n === null) raise(tokStart, "Bad character escape sequence");
    return n;
  }

  // Used to signal to callers of `readWord1` whether the word
  // contained any escape sequences. This is needed because words with
  // escape sequences must not be interpreted as keywords.

  var containsEsc;

  // Read an identifier, and return it as a string. Sets `containsEsc`
  // to whether the word contained a '\u' escape.
  //
  // Only builds up the word character-by-character when it actually
  // containeds an escape, as a micro-optimization.

  function readWord1() {
    containsEsc = false;
    var word, first = true, start = tokPos;
    for (;;) {
      var ch = input.charCodeAt(tokPos);
      if (isIdentifierChar(ch)) {
        if (containsEsc) word += input.charAt(tokPos);
        ++tokPos;
      } else if (ch === 92) { // "\"
        if (!containsEsc) word = input.slice(start, tokPos);
        containsEsc = true;
        if (input.charCodeAt(++tokPos) != 117) // "u"
          raise(tokPos, "Expecting Unicode escape sequence \\uXXXX");
        ++tokPos;
        var esc = readHexChar(4);
        var escStr = String.fromCharCode(esc);
        if (!escStr) raise(tokPos - 1, "Invalid Unicode escape");
        if (!(first ? isIdentifierStart(esc) : isIdentifierChar(esc)))
          raise(tokPos - 4, "Invalid Unicode escape");
        word += escStr;
      } else {
        break;
      }
      first = false;
    }
    return containsEsc ? word : input.slice(start, tokPos);
  }

  // Read an identifier or keyword token. Will check for reserved
  // words when necessary.

  function readWord() {
    var word = readWord1();
    var type = _name;
    if (!containsEsc && isKeyword(word))
      type = keywordTypes[word];
    return finishToken(type, word);
  }

  // ## Parser

  // A recursive descent parser operates by defining functions for all
  // syntactic elements, and recursively calling those, each function
  // advancing the input stream and returning an AST node. Precedence
  // of constructs (for example, the fact that `!x[1]` means `!(x[1])`
  // instead of `(!x)[1]` is handled by the fact that the parser
  // function that parses unary prefix operators is called first, and
  // in turn calls the function that parses `[]` subscripts — that
  // way, it'll receive the node for `x[1]` already parsed, and wraps
  // *that* in the unary operator node.
  //
  // Acorn uses an [operator precedence parser][opp] to handle binary
  // operator precedence, because it is much more compact than using
  // the technique outlined above, which uses different, nesting
  // functions to specify precedence, for all of the ten binary
  // precedence levels that JavaScript defines.
  //
  // [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser

  // ### Parser utilities

  // Continue to the next token.

  function next() {
    lastStart = tokStart;
    lastEnd = tokEnd;
    lastEndLoc = tokEndLoc;
    readToken();
  }

  // Enter strict mode. Re-reads the next token to please pedantic
  // tests ("use strict"; 010; -- should fail).

  function setStrict(strct) {
    strict = strct;
    tokPos = tokStart;
    if (options.locations) {
      while (tokPos < tokLineStart) {
        tokLineStart = input.lastIndexOf("\n", tokLineStart - 2) + 1;
        --tokCurLine;
      }
    }
    skipSpace();
    readToken();
  }

  // Start an AST node, attaching a start offset.

  function Node() {
    this.type = null;
    this.start = tokStart;
    this.end = null;
  }

  exports.Node = Node;

  function SourceLocation() {
    this.start = tokStartLoc;
    this.end = null;
    if (sourceFile !== null) this.source = sourceFile;
  }

  function startNode() {
    var node = new Node();
    if (options.locations)
      node.loc = new SourceLocation();
    if (options.directSourceFile)
      node.sourceFile = options.directSourceFile;
    if (options.ranges)
      node.range = [tokStart, 0];
    return node;
  }

  // Sometimes, a node is only started *after* the token stream passed
  // its start position. The functions below help storing a position
  // and creating a node from a previous position.

  function storeCurrentPos() {
    return options.locations ? [tokStart, tokStartLoc] : tokStart;
  }

  function startNodeAt(pos) {
    var node = new Node(), start = pos;
    if (options.locations) {
      node.loc = new SourceLocation();
      node.loc.start = start[1];
      start = pos[0];
    }
    node.start = start;
    if (options.directSourceFile)
      node.sourceFile = options.directSourceFile;
    if (options.ranges)
      node.range = [start, 0];

    return node;
  }

  // Finish an AST node, adding `type` and `end` properties.

  function finishNode(node, type) {
    node.type = type;
    node.end = lastEnd;
    if (options.locations)
      node.loc.end = lastEndLoc;
    if (options.ranges)
      node.range[1] = lastEnd;
    return node;
  }

  function finishNodeAt(node, type, pos) {
    if (options.locations) { node.loc.end = pos[1]; pos = pos[0]; }
    node.type = type;
    node.end = pos;
    if (options.ranges)
      node.range[1] = pos;
    return node;
  }

  // Test whether a statement node is the string literal `"use strict"`.

  function isUseStrict(stmt) {
    return options.ecmaVersion >= 5 && stmt.type === "ExpressionStatement" &&
      stmt.expression.type === "Literal" && stmt.expression.value === "use strict";
  }

  // Predicate that tests whether the next token is of the given
  // type, and if yes, consumes it as a side effect.

  function eat(type) {
    if (tokType === type) {
      next();
      return true;
    } else {
      return false;
    }
  }

  // Test whether a semicolon can be inserted at the current position.

  function canInsertSemicolon() {
    return !options.strictSemicolons &&
      (tokType === _eof || tokType === _braceR || newline.test(input.slice(lastEnd, tokStart)));
  }

  // Consume a semicolon, or, failing that, see if we are allowed to
  // pretend that there is a semicolon at this position.

  function semicolon() {
    if (!eat(_semi) && !canInsertSemicolon()) unexpected();
  }

  // Expect a token of a given type. If found, consume it, otherwise,
  // raise an unexpected token error.

  function expect(type) {
    eat(type) || unexpected();
  }

  // Raise an unexpected token error.

  function unexpected(pos) {
    raise(pos != null ? pos : tokStart, "Unexpected token");
  }

  // Checks if hash object has a property.

  function has(obj, propName) {
    return Object.prototype.hasOwnProperty.call(obj, propName);
  }
  // Convert existing expression atom to assignable pattern
  // if possible.

  function toAssignable(node, allowSpread, checkType) {
    if (options.ecmaVersion >= 6 && node) {
      switch (node.type) {
        case "Identifier":
        case "MemberExpression":
          break;

        case "ObjectExpression":
          node.type = "ObjectPattern";
          for (var i = 0; i < node.properties.length; i++) {
            var prop = node.properties[i];
            if (prop.kind !== "init") unexpected(prop.key.start);
            toAssignable(prop.value, false, checkType);
          }
          break;

        case "ArrayExpression":
          node.type = "ArrayPattern";
          for (var i = 0, lastI = node.elements.length - 1; i <= lastI; i++) {
            toAssignable(node.elements[i], i === lastI, checkType);
          }
          break;

        case "SpreadElement":
          if (allowSpread) {
            toAssignable(node.argument, false, checkType);
            checkSpreadAssign(node.argument);
          } else {
            unexpected(node.start);
          }
          break;

        default:
          if (checkType) unexpected(node.start);
      }
    }
    return node;
  }

  // Checks if node can be assignable spread argument.

  function checkSpreadAssign(node) {
    if (node.type !== "Identifier" && node.type !== "ArrayPattern")
      unexpected(node.start);
  }

  // Verify that argument names are not repeated, and it does not
  // try to bind the words `eval` or `arguments`.

  function checkFunctionParam(param, nameHash) {
    switch (param.type) {
      case "Identifier":
        if (isStrictReservedWord(param.name) || isStrictBadIdWord(param.name))
          raise(param.start, "Defining '" + param.name + "' in strict mode");
        if (has(nameHash, param.name))
          raise(param.start, "Argument name clash in strict mode");
        nameHash[param.name] = true;
        break;

      case "ObjectPattern":
        for (var i = 0; i < param.properties.length; i++)
          checkFunctionParam(param.properties[i].value, nameHash);
        break;

      case "ArrayPattern":
        for (var i = 0; i < param.elements.length; i++) {
          var elem = param.elements[i];
          if (elem) checkFunctionParam(elem, nameHash);
        }
        break;
    }
  }

  // Check if property name clashes with already added.
  // Object/class getters and setters are not allowed to clash —
  // either with each other or with an init property — and in
  // strict mode, init properties are also not allowed to be repeated.

  function checkPropClash(prop, propHash) {
    if (options.ecmaVersion >= 6) return;
    var key = prop.key, name;
    switch (key.type) {
      case "Identifier": name = key.name; break;
      case "Literal": name = String(key.value); break;
      default: return;
    }
    var kind = prop.kind || "init", other;
    if (has(propHash, name)) {
      other = propHash[name];
      var isGetSet = kind !== "init";
      if ((strict || isGetSet) && other[kind] || !(isGetSet ^ other.init))
        raise(key.start, "Redefinition of property");
    } else {
      other = propHash[name] = {
        init: false,
        get: false,
        set: false
      };
    }
    other[kind] = true;
  }

  // Verify that a node is an lval — something that can be assigned
  // to.

  function checkLVal(expr, isBinding) {
    switch (expr.type) {
      case "Identifier":
        if (strict && (isStrictBadIdWord(expr.name) || isStrictReservedWord(expr.name)))
          raise(expr.start, isBinding
            ? "Binding " + expr.name + " in strict mode"
            : "Assigning to " + expr.name + " in strict mode"
          );
        break;

      case "MemberExpression":
        if (!isBinding) break;

      case "ObjectPattern":
        for (var i = 0; i < expr.properties.length; i++)
          checkLVal(expr.properties[i].value, isBinding);
        break;

      case "ArrayPattern":
        for (var i = 0; i < expr.elements.length; i++) {
          var elem = expr.elements[i];
          if (elem) checkLVal(elem, isBinding);
        }
        break;

      case "SpreadElement":
        break;

      default:
        raise(expr.start, "Assigning to rvalue");
    }
  }

  // ### Statement parsing

  // Parse a program. Initializes the parser, reads any number of
  // statements, and wraps them in a Program node.  Optionally takes a
  // `program` argument.  If present, the statements will be appended
  // to its body instead of creating a new node.

  function parseTopLevel(node) {
    var first = true;
    if (!node.body) node.body = [];
    while (tokType !== _eof) {
      var stmt = parseStatement(true);
      node.body.push(stmt);
      if (first && isUseStrict(stmt)) setStrict(true);
      first = false;
    }

    lastStart = tokStart;
    lastEnd = tokEnd;
    lastEndLoc = tokEndLoc;
    return finishNode(node, "Program");
  }

  var loopLabel = {kind: "loop"}, switchLabel = {kind: "switch"};

  // Parse a single statement.
  //
  // If expecting a statement and finding a slash operator, parse a
  // regular expression literal. This is to handle cases like
  // `if (foo) /blah/.exec(foo);`, where looking at the previous token
  // does not help.

  function parseStatement(topLevel) {
    if (tokType === _slash || tokType === _assign && tokVal == "/=")
      readToken(true);

    var starttype = tokType, node = startNode();

    // Most types of statements are recognized by the keyword they
    // start with. Many are trivial to parse, some require a bit of
    // complexity.

    switch (starttype) {
    case _break: case _continue: return parseBreakContinueStatement(node, starttype.keyword);
    case _debugger: return parseDebuggerStatement(node);
    case _do: return parseDoStatement(node);
    case _for: return parseForStatement(node);
    case _function: return parseFunctionStatement(node);
    case _class: return parseClass(node, true);
    case _if: return parseIfStatement(node);
    case _return: return parseReturnStatement(node);
    case _switch: return parseSwitchStatement(node);
    case _throw: return parseThrowStatement(node);
    case _try: return parseTryStatement(node);
    case _var: case _let: case _const: return parseVarStatement(node, starttype.keyword);
    case _while: return parseWhileStatement(node);
    case _with: return parseWithStatement(node);
    case _braceL: return parseBlock(); // no point creating a function for this
    case _semi: return parseEmptyStatement(node);
    case _export:
    case _import:
      if (!topLevel && !options.allowImportExportEverywhere)
        raise(tokStart, "'import' and 'export' may only appear at the top level");
      return starttype === _import ? parseImport(node) : parseExport(node);

      // If the statement does not start with a statement keyword or a
      // brace, it's an ExpressionStatement or LabeledStatement. We
      // simply start parsing an expression, and afterwards, if the
      // next token is a colon and the expression was a simple
      // Identifier node, we switch to interpreting it as a label.
    default:
      var maybeName = tokVal, expr = parseExpression();
      if (starttype === _name && expr.type === "Identifier" && eat(_colon))
        return parseLabeledStatement(node, maybeName, expr);
      else return parseExpressionStatement(node, expr);
    }
  }

  function parseBreakContinueStatement(node, keyword) {
    var isBreak = keyword == "break";
    next();
    if (eat(_semi) || canInsertSemicolon()) node.label = null;
    else if (tokType !== _name) unexpected();
    else {
      node.label = parseIdent();
      semicolon();
    }

    // Verify that there is an actual destination to break or
    // continue to.
    for (var i = 0; i < labels.length; ++i) {
      var lab = labels[i];
      if (node.label == null || lab.name === node.label.name) {
        if (lab.kind != null && (isBreak || lab.kind === "loop")) break;
        if (node.label && isBreak) break;
      }
    }
    if (i === labels.length) raise(node.start, "Unsyntactic " + keyword);
    return finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement");
  }

  function parseDebuggerStatement(node) {
    next();
    semicolon();
    return finishNode(node, "DebuggerStatement");
  }

  function parseDoStatement(node) {
    next();
    labels.push(loopLabel);
    node.body = parseStatement();
    labels.pop();
    expect(_while);
    node.test = parseParenExpression();
    if (options.ecmaVersion >= 6)
      eat(_semi);
    else
      semicolon();
    return finishNode(node, "DoWhileStatement");
  }

  // Disambiguating between a `for` and a `for`/`in` or `for`/`of`
  // loop is non-trivial. Basically, we have to parse the init `var`
  // statement or expression, disallowing the `in` operator (see
  // the second parameter to `parseExpression`), and then check
  // whether the next token is `in` or `of`. When there is no init
  // part (semicolon immediately after the opening parenthesis), it
  // is a regular `for` loop.

  function parseForStatement(node) {
    next();
    labels.push(loopLabel);
    expect(_parenL);
    if (tokType === _semi) return parseFor(node, null);
    if (tokType === _var || tokType === _let) {
      var init = startNode(), varKind = tokType.keyword, isLet = tokType === _let;
      next();
      parseVar(init, true, varKind);
      finishNode(init, "VariableDeclaration");
      if ((tokType === _in || (options.ecmaVersion >= 6 && tokType === _name && tokVal === "of")) && init.declarations.length === 1 &&
          !(isLet && init.declarations[0].init))
        return parseForIn(node, init);
      return parseFor(node, init);
    }
    var init = parseExpression(false, true);
    if (tokType === _in || (options.ecmaVersion >= 6 && tokType === _name && tokVal === "of")) {
      checkLVal(init);
      return parseForIn(node, init);
    }
    return parseFor(node, init);
  }

  function parseFunctionStatement(node) {
    next();
    return parseFunction(node, true);
  }

  function parseIfStatement(node) {
    next();
    node.test = parseParenExpression();
    node.consequent = parseStatement();
    node.alternate = eat(_else) ? parseStatement() : null;
    return finishNode(node, "IfStatement");
  }

  function parseReturnStatement(node) {
    if (!inFunction && !options.allowReturnOutsideFunction)
      raise(tokStart, "'return' outside of function");
    next();

    // In `return` (and `break`/`continue`), the keywords with
    // optional arguments, we eagerly look for a semicolon or the
    // possibility to insert one.

    if (eat(_semi) || canInsertSemicolon()) node.argument = null;
    else { node.argument = parseExpression(); semicolon(); }
    return finishNode(node, "ReturnStatement");
  }

  function parseSwitchStatement(node) {
    next();
    node.discriminant = parseParenExpression();
    node.cases = [];
    expect(_braceL);
    labels.push(switchLabel);

    // Statements under must be grouped (by label) in SwitchCase
    // nodes. `cur` is used to keep the node that we are currently
    // adding statements to.

    for (var cur, sawDefault; tokType != _braceR;) {
      if (tokType === _case || tokType === _default) {
        var isCase = tokType === _case;
        if (cur) finishNode(cur, "SwitchCase");
        node.cases.push(cur = startNode());
        cur.consequent = [];
        next();
        if (isCase) cur.test = parseExpression();
        else {
          if (sawDefault) raise(lastStart, "Multiple default clauses"); sawDefault = true;
          cur.test = null;
        }
        expect(_colon);
      } else {
        if (!cur) unexpected();
        cur.consequent.push(parseStatement());
      }
    }
    if (cur) finishNode(cur, "SwitchCase");
    next(); // Closing brace
    labels.pop();
    return finishNode(node, "SwitchStatement");
  }

  function parseThrowStatement(node) {
    next();
    if (newline.test(input.slice(lastEnd, tokStart)))
      raise(lastEnd, "Illegal newline after throw");
    node.argument = parseExpression();
    semicolon();
    return finishNode(node, "ThrowStatement");
  }

  function parseTryStatement(node) {
    next();
    node.block = parseBlock();
    node.handler = null;
    if (tokType === _catch) {
      var clause = startNode();
      next();
      expect(_parenL);
      clause.param = parseIdent();
      if (strict && isStrictBadIdWord(clause.param.name))
        raise(clause.param.start, "Binding " + clause.param.name + " in strict mode");
      expect(_parenR);
      clause.guard = null;
      clause.body = parseBlock();
      node.handler = finishNode(clause, "CatchClause");
    }
    node.guardedHandlers = empty;
    node.finalizer = eat(_finally) ? parseBlock() : null;
    if (!node.handler && !node.finalizer)
      raise(node.start, "Missing catch or finally clause");
    return finishNode(node, "TryStatement");
  }

  function parseVarStatement(node, kind) {
    next();
    parseVar(node, false, kind);
    semicolon();
    return finishNode(node, "VariableDeclaration");
  }

  function parseWhileStatement(node) {
    next();
    node.test = parseParenExpression();
    labels.push(loopLabel);
    node.body = parseStatement();
    labels.pop();
    return finishNode(node, "WhileStatement");
  }

  function parseWithStatement(node) {
    if (strict) raise(tokStart, "'with' in strict mode");
    next();
    node.object = parseParenExpression();
    node.body = parseStatement();
    return finishNode(node, "WithStatement");
  }

  function parseEmptyStatement(node) {
    next();
    return finishNode(node, "EmptyStatement");
  }

  function parseLabeledStatement(node, maybeName, expr) {
    for (var i = 0; i < labels.length; ++i)
      if (labels[i].name === maybeName) raise(expr.start, "Label '" + maybeName + "' is already declared");
    var kind = tokType.isLoop ? "loop" : tokType === _switch ? "switch" : null;
    labels.push({name: maybeName, kind: kind});
    node.body = parseStatement();
    labels.pop();
    node.label = expr;
    return finishNode(node, "LabeledStatement");
  }

  function parseExpressionStatement(node, expr) {
    node.expression = expr;
    semicolon();
    return finishNode(node, "ExpressionStatement");
  }

  // Used for constructs like `switch` and `if` that insist on
  // parentheses around their expression.

  function parseParenExpression() {
    expect(_parenL);
    var val = parseExpression();
    expect(_parenR);
    return val;
  }

  // Parse a semicolon-enclosed block of statements, handling `"use
  // strict"` declarations when `allowStrict` is true (used for
  // function bodies).

  function parseBlock(allowStrict) {
    var node = startNode(), first = true, oldStrict;
    node.body = [];
    expect(_braceL);
    while (!eat(_braceR)) {
      var stmt = parseStatement();
      node.body.push(stmt);
      if (first && allowStrict && isUseStrict(stmt)) {
        oldStrict = strict;
        setStrict(strict = true);
      }
      first = false;
    }
    if (oldStrict === false) setStrict(false);
    return finishNode(node, "BlockStatement");
  }

  // Parse a regular `for` loop. The disambiguation code in
  // `parseStatement` will already have parsed the init statement or
  // expression.

  function parseFor(node, init) {
    node.init = init;
    expect(_semi);
    node.test = tokType === _semi ? null : parseExpression();
    expect(_semi);
    node.update = tokType === _parenR ? null : parseExpression();
    expect(_parenR);
    node.body = parseStatement();
    labels.pop();
    return finishNode(node, "ForStatement");
  }

  // Parse a `for`/`in` and `for`/`of` loop, which are almost
  // same from parser's perspective.

  function parseForIn(node, init) {
    var type = tokType === _in ? "ForInStatement" : "ForOfStatement";
    next();
    node.left = init;
    node.right = parseExpression();
    expect(_parenR);
    node.body = parseStatement();
    labels.pop();
    return finishNode(node, type);
  }

  // Parse a list of variable declarations.

  function parseVar(node, noIn, kind) {
    node.declarations = [];
    node.kind = kind;
    for (;;) {
      var decl = startNode();
      decl.id = options.ecmaVersion >= 6 ? toAssignable(parseExprAtom()) : parseIdent();
      checkLVal(decl.id, true);
      decl.init = eat(_eq) ? parseExpression(true, noIn) : (kind === _const.keyword ? unexpected() : null);
      node.declarations.push(finishNode(decl, "VariableDeclarator"));
      if (!eat(_comma)) break;
    }
    return node;
  }

  // ### Expression parsing

  // These nest, from the most general expression type at the top to
  // 'atomic', nondivisible expression types at the bottom. Most of
  // the functions will simply let the function(s) below them parse,
  // and, *if* the syntactic construct they handle is present, wrap
  // the AST node that the inner parser gave them in another node.

  // Parse a full expression. The arguments are used to forbid comma
  // sequences (in argument lists, array literals, or object literals)
  // or the `in` operator (in for loops initalization expressions).

  function parseExpression(noComma, noIn) {
    var start = storeCurrentPos();
    var expr = parseMaybeAssign(noIn);
    if (!noComma && tokType === _comma) {
      var node = startNodeAt(start);
      node.expressions = [expr];
      while (eat(_comma)) node.expressions.push(parseMaybeAssign(noIn));
      return finishNode(node, "SequenceExpression");
    }
    return expr;
  }

  // Parse an assignment expression. This includes applications of
  // operators like `+=`.

  function parseMaybeAssign(noIn) {
    var start = storeCurrentPos();
    var left = parseMaybeConditional(noIn);
    if (tokType.isAssign) {
      var node = startNodeAt(start);
      node.operator = tokVal;
      node.left = tokType === _eq ? toAssignable(left) : left;
      checkLVal(left);
      next();
      node.right = parseMaybeAssign(noIn);
      return finishNode(node, "AssignmentExpression");
    }
    return left;
  }

  // Parse a ternary conditional (`?:`) operator.

  function parseMaybeConditional(noIn) {
    var start = storeCurrentPos();
    var expr = parseExprOps(noIn);
    if (eat(_question)) {
      var node = startNodeAt(start);
      node.test = expr;
      node.consequent = parseExpression(true);
      expect(_colon);
      node.alternate = parseExpression(true, noIn);
      return finishNode(node, "ConditionalExpression");
    }
    return expr;
  }

  // Start the precedence parser.

  function parseExprOps(noIn) {
    var start = storeCurrentPos();
    return parseExprOp(parseMaybeUnary(), start, -1, noIn);
  }

  // Parse binary operators with the operator precedence parsing
  // algorithm. `left` is the left-hand side of the operator.
  // `minPrec` provides context that allows the function to stop and
  // defer further parser to one of its callers when it encounters an
  // operator that has a lower precedence than the set it is parsing.

  function parseExprOp(left, leftStart, minPrec, noIn) {
    var prec = tokType.binop;
    if (prec != null && (!noIn || tokType !== _in)) {
      if (prec > minPrec) {
        var node = startNodeAt(leftStart);
        node.left = left;
        node.operator = tokVal;
        var op = tokType;
        next();
        var start = storeCurrentPos();
        node.right = parseExprOp(parseMaybeUnary(), start, prec, noIn);
        finishNode(node, (op === _logicalOR || op === _logicalAND) ? "LogicalExpression" : "BinaryExpression");
        return parseExprOp(node, leftStart, minPrec, noIn);
      }
    }
    return left;
  }

  // Parse unary operators, both prefix and postfix.

  function parseMaybeUnary() {
    if (tokType.prefix) {
      var node = startNode(), update = tokType.isUpdate, nodeType;
      if (tokType === _ellipsis) {
        nodeType = "SpreadElement";
      } else {
        nodeType = update ? "UpdateExpression" : "UnaryExpression";
        node.operator = tokVal;
        node.prefix = true;
      }
      tokRegexpAllowed = true;
      next();
      node.argument = parseMaybeUnary();
      if (update) checkLVal(node.argument);
      else if (strict && node.operator === "delete" &&
               node.argument.type === "Identifier")
        raise(node.start, "Deleting local variable in strict mode");
      return finishNode(node, nodeType);
    }
    var start = storeCurrentPos();
    var expr = parseExprSubscripts();
    while (tokType.postfix && !canInsertSemicolon()) {
      var node = startNodeAt(start);
      node.operator = tokVal;
      node.prefix = false;
      node.argument = expr;
      checkLVal(expr);
      next();
      expr = finishNode(node, "UpdateExpression");
    }
    return expr;
  }

  // Parse call, dot, and `[]`-subscript expressions.

  function parseExprSubscripts() {
    var start = storeCurrentPos();
    return parseSubscripts(parseExprAtom(), start);
  }

  function parseSubscripts(base, start, noCalls) {
    if (eat(_dot)) {
      var node = startNodeAt(start);
      node.object = base;
      node.property = parseIdent(true);
      node.computed = false;
      return parseSubscripts(finishNode(node, "MemberExpression"), start, noCalls);
    } else if (eat(_bracketL)) {
      var node = startNodeAt(start);
      node.object = base;
      node.property = parseExpression();
      node.computed = true;
      expect(_bracketR);
      return parseSubscripts(finishNode(node, "MemberExpression"), start, noCalls);
    } else if (!noCalls && eat(_parenL)) {
      var node = startNodeAt(start);
      node.callee = base;
      node.arguments = parseExprList(_parenR, false);
      return parseSubscripts(finishNode(node, "CallExpression"), start, noCalls);
    } else if (tokType === _template) {
      var node = startNodeAt(start);
      node.tag = base;
      node.quasi = parseTemplate();
      return parseSubscripts(finishNode(node, "TaggedTemplateExpression"), start, noCalls);
    } return base;
  }

  // Parse an atomic expression — either a single token that is an
  // expression, an expression started by a keyword like `function` or
  // `new`, or an expression wrapped in punctuation like `()`, `[]`,
  // or `{}`.

  function parseExprAtom() {
    switch (tokType) {
    case _this:
      var node = startNode();
      next();
      return finishNode(node, "ThisExpression");

    case _yield:
      if (inGenerator) return parseYield();

    case _name:
      var start = storeCurrentPos();
      var id = parseIdent(tokType !== _name);
      if (eat(_arrow)) {
        return parseArrowExpression(startNodeAt(start), [id]);
      }
      return id;

    case _regexp:
      var node = startNode();
      node.regex = {pattern: tokVal.pattern, flags: tokVal.flags};
      node.value = tokVal.value;
      node.raw = input.slice(tokStart, tokEnd);
      next();
      return finishNode(node, "Literal");

    case _num: case _string:
      var node = startNode();
      node.value = tokVal;
      node.raw = input.slice(tokStart, tokEnd);
      next();
      return finishNode(node, "Literal");

    case _null: case _true: case _false:
      var node = startNode();
      node.value = tokType.atomValue;
      node.raw = tokType.keyword;
      next();
      return finishNode(node, "Literal");

    case _parenL:
      var start = storeCurrentPos();
      var val, exprList;
      next();
      // check whether this is generator comprehension or regular expression
      if (options.ecmaVersion >= 7 && tokType === _for) {
        val = parseComprehension(startNodeAt(start), true);
      } else {
        var oldParenL = ++metParenL;
        if (tokType !== _parenR) {
          val = parseExpression();
          exprList = val.type === "SequenceExpression" ? val.expressions : [val];
        } else {
          exprList = [];
        }
        expect(_parenR);
        // if '=>' follows '(...)', convert contents to arguments
        if (metParenL === oldParenL && eat(_arrow)) {
          val = parseArrowExpression(startNodeAt(start), exprList);
        } else {
          // forbid '()' before everything but '=>'
          if (!val) unexpected(lastStart);
          // forbid '...' in sequence expressions
          if (options.ecmaVersion >= 6) {
            for (var i = 0; i < exprList.length; i++) {
              if (exprList[i].type === "SpreadElement") unexpected();
            }
          }

          if (options.preserveParens) {
            var par = startNodeAt(start);
            par.expression = val;
            val = finishNode(par, "ParenthesizedExpression");
          }
        }
      }
      return val;

    case _bracketL:
      var node = startNode();
      next();
      // check whether this is array comprehension or regular array
      if (options.ecmaVersion >= 7 && tokType === _for) {
        return parseComprehension(node, false);
      }
      node.elements = parseExprList(_bracketR, true, true);
      return finishNode(node, "ArrayExpression");

    case _braceL:
      return parseObj();

    case _function:
      var node = startNode();
      next();
      return parseFunction(node, false);

    case _class:
      return parseClass(startNode(), false);

    case _new:
      return parseNew();

    case _template:
      return parseTemplate();

    default:
      unexpected();
    }
  }

  // New's precedence is slightly tricky. It must allow its argument
  // to be a `[]` or dot subscript expression, but not a call — at
  // least, not without wrapping it in parentheses. Thus, it uses the

  function parseNew() {
    var node = startNode();
    next();
    var start = storeCurrentPos();
    node.callee = parseSubscripts(parseExprAtom(), start, true);
    if (eat(_parenL)) node.arguments = parseExprList(_parenR, false);
    else node.arguments = empty;
    return finishNode(node, "NewExpression");
  }

  // Parse template expression.

  function parseTemplateElement() {
    var elem = startNodeAt(options.locations ? [tokStart + 1, tokStartLoc.offset(1)] : tokStart + 1);
    elem.value = tokVal;
    elem.tail = input.charCodeAt(tokEnd - 1) !== 123; // '{'
    next();
    var endOff = elem.tail ? 1 : 2;
    return finishNodeAt(elem, "TemplateElement", options.locations ? [lastEnd - endOff, lastEndLoc.offset(-endOff)] : lastEnd - endOff);
  }

  function parseTemplate() {
    var node = startNode();
    node.expressions = [];
    var curElt = parseTemplateElement();
    node.quasis = [curElt];
    while (!curElt.tail) {
      node.expressions.push(parseExpression());
      if (tokType !== _templateContinued) unexpected();
      node.quasis.push(curElt = parseTemplateElement());
    }
    return finishNode(node, "TemplateLiteral");
  }

  // Parse an object literal.

  function parseObj() {
    var node = startNode(), first = true, propHash = {};
    node.properties = [];
    next();
    while (!eat(_braceR)) {
      if (!first) {
        expect(_comma);
        if (options.allowTrailingCommas && eat(_braceR)) break;
      } else first = false;

      var prop = startNode(), isGenerator;
      if (options.ecmaVersion >= 6) {
        prop.method = false;
        prop.shorthand = false;
        isGenerator = eat(_star);
      }
      parsePropertyName(prop);
      if (eat(_colon)) {
        prop.value = parseExpression(true);
        prop.kind = "init";
      } else if (options.ecmaVersion >= 6 && tokType === _parenL) {
        prop.kind = "init";
        prop.method = true;
        prop.value = parseMethod(isGenerator);
      } else if (options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" &&
                 (prop.key.name === "get" || prop.key.name === "set")) {
        if (isGenerator) unexpected();
        prop.kind = prop.key.name;
        parsePropertyName(prop);
        prop.value = parseMethod(false);
      } else if (options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
        prop.kind = "init";
        prop.value = prop.key;
        prop.shorthand = true;
      } else unexpected();

      checkPropClash(prop, propHash);
      node.properties.push(finishNode(prop, "Property"));
    }
    return finishNode(node, "ObjectExpression");
  }

  function parsePropertyName(prop) {
    if (options.ecmaVersion >= 6) {
      if (eat(_bracketL)) {
        prop.computed = true;
        prop.key = parseExpression();
        expect(_bracketR);
        return;
      } else {
        prop.computed = false;
      }
    }
    prop.key = (tokType === _num || tokType === _string) ? parseExprAtom() : parseIdent(true);
  }

  // Initialize empty function node.

  function initFunction(node) {
    node.id = null;
    node.params = [];
    if (options.ecmaVersion >= 6) {
      node.defaults = [];
      node.rest = null;
      node.generator = false;
    }
  }

  // Parse a function declaration or literal (depending on the
  // `isStatement` parameter).

  function parseFunction(node, isStatement, allowExpressionBody) {
    initFunction(node);
    if (options.ecmaVersion >= 6) {
      node.generator = eat(_star);
    }
    if (isStatement || tokType === _name) {
      node.id = parseIdent();
    }
    parseFunctionParams(node);
    parseFunctionBody(node, allowExpressionBody);
    return finishNode(node, isStatement ? "FunctionDeclaration" : "FunctionExpression");
  }

  // Parse object or class method.

  function parseMethod(isGenerator) {
    var node = startNode();
    initFunction(node);
    parseFunctionParams(node);
    var allowExpressionBody;
    if (options.ecmaVersion >= 6) {
      node.generator = isGenerator;
      allowExpressionBody = true;
    } else {
      allowExpressionBody = false;
    }
    parseFunctionBody(node, allowExpressionBody);
    return finishNode(node, "FunctionExpression");
  }

  // Parse arrow function expression with given parameters.

  function parseArrowExpression(node, params) {
    initFunction(node);

    var defaults = node.defaults, hasDefaults = false;

    for (var i = 0, lastI = params.length - 1; i <= lastI; i++) {
      var param = params[i];

      if (param.type === "AssignmentExpression" && param.operator === "=") {
        hasDefaults = true;
        params[i] = param.left;
        defaults.push(param.right);
      } else {
        toAssignable(param, i === lastI, true);
        defaults.push(null);
        if (param.type === "SpreadElement") {
          params.length--;
          node.rest = param.argument;
          break;
        }
      }
    }

    node.params = params;
    if (!hasDefaults) node.defaults = [];

    parseFunctionBody(node, true);
    return finishNode(node, "ArrowFunctionExpression");
  }

  // Parse function parameters.

  function parseFunctionParams(node) {
    var defaults = [], hasDefaults = false;

    expect(_parenL);
    for (;;) {
      if (eat(_parenR)) {
        break;
      } else if (options.ecmaVersion >= 6 && eat(_ellipsis)) {
        node.rest = toAssignable(parseExprAtom(), false, true);
        checkSpreadAssign(node.rest);
        expect(_parenR);
        defaults.push(null);
        break;
      } else {
        node.params.push(options.ecmaVersion >= 6 ? toAssignable(parseExprAtom(), false, true) : parseIdent());
        if (options.ecmaVersion >= 6) {
          if (eat(_eq)) {
            hasDefaults = true;
            defaults.push(parseExpression(true));
          } else {
            defaults.push(null);
          }
        }
        if (!eat(_comma)) {
          expect(_parenR);
          break;
        }
      }
    }

    if (hasDefaults) node.defaults = defaults;
  }

  // Parse function body and check parameters.

  function parseFunctionBody(node, allowExpression) {
    var isExpression = allowExpression && tokType !== _braceL;

    if (isExpression) {
      node.body = parseExpression(true);
      node.expression = true;
    } else {
      // Start a new scope with regard to labels and the `inFunction`
      // flag (restore them to their old value afterwards).
      var oldInFunc = inFunction, oldInGen = inGenerator, oldLabels = labels;
      inFunction = true; inGenerator = node.generator; labels = [];
      node.body = parseBlock(true);
      node.expression = false;
      inFunction = oldInFunc; inGenerator = oldInGen; labels = oldLabels;
    }

    // If this is a strict mode function, verify that argument names
    // are not repeated, and it does not try to bind the words `eval`
    // or `arguments`.
    if (strict || !isExpression && node.body.body.length && isUseStrict(node.body.body[0])) {
      var nameHash = {};
      if (node.id)
        checkFunctionParam(node.id, {});
      for (var i = 0; i < node.params.length; i++)
        checkFunctionParam(node.params[i], nameHash);
      if (node.rest)
        checkFunctionParam(node.rest, nameHash);
    }
  }

  // Parse a class declaration or literal (depending on the
  // `isStatement` parameter).

  function parseClass(node, isStatement) {
    next();
    node.id = tokType === _name ? parseIdent() : isStatement ? unexpected() : null;
    node.superClass = eat(_extends) ? parseExpression() : null;
    var classBody = startNode();
    classBody.body = [];
    expect(_braceL);
    while (!eat(_braceR)) {
      var method = startNode();
      if (tokType === _name && tokVal === "static") {
        next();
        method['static'] = true;
      } else {
        method['static'] = false;
      }
      var isGenerator = eat(_star);
      parsePropertyName(method);
      if (tokType !== _parenL && !method.computed && method.key.type === "Identifier" &&
          (method.key.name === "get" || method.key.name === "set")) {
        if (isGenerator) unexpected();
        method.kind = method.key.name;
        parsePropertyName(method);
      } else {
        method.kind = "";
      }
      method.value = parseMethod(isGenerator);
      classBody.body.push(finishNode(method, "MethodDefinition"));
      eat(_semi);
    }
    node.body = finishNode(classBody, "ClassBody");
    return finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression");
  }

  // Parses a comma-separated list of expressions, and returns them as
  // an array. `close` is the token type that ends the list, and
  // `allowEmpty` can be turned on to allow subsequent commas with
  // nothing in between them to be parsed as `null` (which is needed
  // for array literals).

  function parseExprList(close, allowTrailingComma, allowEmpty) {
    var elts = [], first = true;
    while (!eat(close)) {
      if (!first) {
        expect(_comma);
        if (allowTrailingComma && options.allowTrailingCommas && eat(close)) break;
      } else first = false;

      if (allowEmpty && tokType === _comma) elts.push(null);
      else elts.push(parseExpression(true));
    }
    return elts;
  }

  // Parse the next token as an identifier. If `liberal` is true (used
  // when parsing properties), it will also convert keywords into
  // identifiers.

  function parseIdent(liberal) {
    var node = startNode();
    if (liberal && options.forbidReserved == "everywhere") liberal = false;
    if (tokType === _name) {
      if (!liberal &&
          (options.forbidReserved &&
           (options.ecmaVersion === 3 ? isReservedWord3 : isReservedWord5)(tokVal) ||
           strict && isStrictReservedWord(tokVal)) &&
          input.slice(tokStart, tokEnd).indexOf("\\") == -1)
        raise(tokStart, "The keyword '" + tokVal + "' is reserved");
      node.name = tokVal;
    } else if (liberal && tokType.keyword) {
      node.name = tokType.keyword;
    } else {
      unexpected();
    }
    tokRegexpAllowed = false;
    next();
    return finishNode(node, "Identifier");
  }

  // Parses module export declaration.

  function parseExport(node) {
    next();
    // export var|const|let|function|class ...;
    if (tokType === _var || tokType === _const || tokType === _let || tokType === _function || tokType === _class) {
      node.declaration = parseStatement();
      node['default'] = false;
      node.specifiers = null;
      node.source = null;
    } else
    // export default ...;
    if (eat(_default)) {
      node.declaration = parseExpression(true);
      node['default'] = true;
      node.specifiers = null;
      node.source = null;
      semicolon();
    } else {
      // export * from '...';
      // export { x, y as z } [from '...'];
      var isBatch = tokType === _star;
      node.declaration = null;
      node['default'] = false;
      node.specifiers = parseExportSpecifiers();
      if (tokType === _name && tokVal === "from") {
        next();
        node.source = tokType === _string ? parseExprAtom() : unexpected();
      } else {
        if (isBatch) unexpected();
        node.source = null;
      }
      semicolon();
    }
    return finishNode(node, "ExportDeclaration");
  }

  // Parses a comma-separated list of module exports.

  function parseExportSpecifiers() {
    var nodes = [], first = true;
    if (tokType === _star) {
      // export * from '...'
      var node = startNode();
      next();
      nodes.push(finishNode(node, "ExportBatchSpecifier"));
    } else {
      // export { x, y as z } [from '...']
      expect(_braceL);
      while (!eat(_braceR)) {
        if (!first) {
          expect(_comma);
          if (options.allowTrailingCommas && eat(_braceR)) break;
        } else first = false;

        var node = startNode();
        node.id = parseIdent(tokType === _default);
        if (tokType === _name && tokVal === "as") {
          next();
          node.name = parseIdent(true);
        } else {
          node.name = null;
        }
        nodes.push(finishNode(node, "ExportSpecifier"));
      }
    }
    return nodes;
  }

  // Parses import declaration.

  function parseImport(node) {
    next();
    // import '...';
    if (tokType === _string) {
      node.specifiers = [];
      node.source = parseExprAtom();
      node.kind = "";
    } else {
      node.specifiers = parseImportSpecifiers();
      if (tokType !== _name || tokVal !== "from") unexpected();
      next();
      node.source = tokType === _string ? parseExprAtom() : unexpected();
    }
    semicolon();
    return finishNode(node, "ImportDeclaration");
  }

  // Parses a comma-separated list of module imports.

  function parseImportSpecifiers() {
    var nodes = [], first = true;
    if (tokType === _name) {
      // import defaultObj, { x, y as z } from '...'
      var node = startNode();
      node.id = parseIdent();
      checkLVal(node.id, true);
      node.name = null;
      node['default'] = true;
      nodes.push(finishNode(node, "ImportSpecifier"));
      if (!eat(_comma)) return nodes;
    }
    if (tokType === _star) {
      var node = startNode();
      next();
      if (tokType !== _name || tokVal !== "as") unexpected();
      next();
      node.name = parseIdent();
      checkLVal(node.name, true);
      nodes.push(finishNode(node, "ImportBatchSpecifier"));
      return nodes;
    }
    expect(_braceL);
    while (!eat(_braceR)) {
      if (!first) {
        expect(_comma);
        if (options.allowTrailingCommas && eat(_braceR)) break;
      } else first = false;

      var node = startNode();
      node.id = parseIdent(true);
      if (tokType === _name && tokVal === "as") {
        next();
        node.name = parseIdent();
      } else {
        node.name = null;
      }
      checkLVal(node.name || node.id, true);
      node['default'] = false;
      nodes.push(finishNode(node, "ImportSpecifier"));
    }
    return nodes;
  }

  // Parses yield expression inside generator.

  function parseYield() {
    var node = startNode();
    next();
    if (eat(_semi) || canInsertSemicolon()) {
      node.delegate = false;
      node.argument = null;
    } else {
      node.delegate = eat(_star);
      node.argument = parseExpression(true);
    }
    return finishNode(node, "YieldExpression");
  }

  // Parses array and generator comprehensions.

  function parseComprehension(node, isGenerator) {
    node.blocks = [];
    while (tokType === _for) {
      var block = startNode();
      next();
      expect(_parenL);
      block.left = toAssignable(parseExprAtom());
      checkLVal(block.left, true);
      if (tokType !== _name || tokVal !== "of") unexpected();
      next();
      // `of` property is here for compatibility with Esprima's AST
      // which also supports deprecated [for (... in ...) expr]
      block.of = true;
      block.right = parseExpression();
      expect(_parenR);
      node.blocks.push(finishNode(block, "ComprehensionBlock"));
    }
    node.filter = eat(_if) ? parseParenExpression() : null;
    node.body = parseExpression();
    expect(isGenerator ? _parenR : _bracketR);
    node.generator = isGenerator;
    return finishNode(node, "ComprehensionExpression");
  }

});

},{}],2:[function(require,module,exports){
// AST walker module for Mozilla Parser API compatible trees

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") return mod(exports); // CommonJS
  if (typeof define == "function" && define.amd) return define(["exports"], mod); // AMD
  mod((this.acorn || (this.acorn = {})).walk = {}); // Plain browser env
})(function(exports) {
  "use strict";

  // A simple walk is one where you simply specify callbacks to be
  // called on specific nodes. The last two arguments are optional. A
  // simple use would be
  //
  //     walk.simple(myTree, {
  //         Expression: function(node) { ... }
  //     });
  //
  // to do something with all expressions. All Parser API node types
  // can be used to identify node types, as well as Expression,
  // Statement, and ScopeBody, which denote categories of nodes.
  //
  // The base argument can be used to pass a custom (recursive)
  // walker, and state can be used to give this walked an initial
  // state.
  exports.simple = function(node, visitors, base, state) {
    if (!base) base = exports.base;
    function c(node, st, override) {
      var type = override || node.type, found = visitors[type];
      base[type](node, st, c);
      if (found) found(node, st);
    }
    c(node, state);
  };

  // An ancestor walk builds up an array of ancestor nodes (including
  // the current node) and passes them to the callback as the state parameter.
  exports.ancestor = function(node, visitors, base, state) {
    if (!base) base = exports.base;
    if (!state) state = [];
    function c(node, st, override) {
      var type = override || node.type, found = visitors[type];
      if (node != st[st.length - 1]) {
        st = st.slice();
        st.push(node);
      }
      base[type](node, st, c);
      if (found) found(node, st);
    }
    c(node, state);
  };

  // A recursive walk is one where your functions override the default
  // walkers. They can modify and replace the state parameter that's
  // threaded through the walk, and can opt how and whether to walk
  // their child nodes (by calling their third argument on these
  // nodes).
  exports.recursive = function(node, state, funcs, base) {
    var visitor = funcs ? exports.make(funcs, base) : base;
    function c(node, st, override) {
      visitor[override || node.type](node, st, c);
    }
    c(node, state);
  };

  function makeTest(test) {
    if (typeof test == "string")
      return function(type) { return type == test; };
    else if (!test)
      return function() { return true; };
    else
      return test;
  }

  function Found(node, state) { this.node = node; this.state = state; }

  // Find a node with a given start, end, and type (all are optional,
  // null can be used as wildcard). Returns a {node, state} object, or
  // undefined when it doesn't find a matching node.
  exports.findNodeAt = function(node, start, end, test, base, state) {
    test = makeTest(test);
    try {
      if (!base) base = exports.base;
      var c = function(node, st, override) {
        var type = override || node.type;
        if ((start == null || node.start <= start) &&
            (end == null || node.end >= end))
          base[type](node, st, c);
        if (test(type, node) &&
            (start == null || node.start == start) &&
            (end == null || node.end == end))
          throw new Found(node, st);
      };
      c(node, state);
    } catch (e) {
      if (e instanceof Found) return e;
      throw e;
    }
  };

  // Find the innermost node of a given type that contains the given
  // position. Interface similar to findNodeAt.
  exports.findNodeAround = function(node, pos, test, base, state) {
    test = makeTest(test);
    try {
      if (!base) base = exports.base;
      var c = function(node, st, override) {
        var type = override || node.type;
        if (node.start > pos || node.end < pos) return;
        base[type](node, st, c);
        if (test(type, node)) throw new Found(node, st);
      };
      c(node, state);
    } catch (e) {
      if (e instanceof Found) return e;
      throw e;
    }
  };

  // Find the outermost matching node after a given position.
  exports.findNodeAfter = function(node, pos, test, base, state) {
    test = makeTest(test);
    try {
      if (!base) base = exports.base;
      var c = function(node, st, override) {
        if (node.end < pos) return;
        var type = override || node.type;
        if (node.start >= pos && test(type, node)) throw new Found(node, st);
        base[type](node, st, c);
      };
      c(node, state);
    } catch (e) {
      if (e instanceof Found) return e;
      throw e;
    }
  };

  // Find the outermost matching node before a given position.
  exports.findNodeBefore = function(node, pos, test, base, state) {
    test = makeTest(test);
    if (!base) base = exports.base;
    var max;
    var c = function(node, st, override) {
      if (node.start > pos) return;
      var type = override || node.type;
      if (node.end <= pos && (!max || max.node.end < node.end) && test(type, node))
        max = new Found(node, st);
      base[type](node, st, c);
    };
    c(node, state);
    return max;
  };

  // Used to create a custom walker. Will fill in all missing node
  // type properties with the defaults.
  exports.make = function(funcs, base) {
    if (!base) base = exports.base;
    var visitor = {};
    for (var type in base) visitor[type] = base[type];
    for (var type in funcs) visitor[type] = funcs[type];
    return visitor;
  };

  function skipThrough(node, st, c) { c(node, st); }
  function ignore(_node, _st, _c) {}

  // Node walkers.

  var base = exports.base = {};
  base.Program = base.BlockStatement = function(node, st, c) {
    for (var i = 0; i < node.body.length; ++i)
      c(node.body[i], st, "Statement");
  };
  base.Statement = skipThrough;
  base.EmptyStatement = ignore;
  base.ExpressionStatement = function(node, st, c) {
    c(node.expression, st, "Expression");
  };
  base.IfStatement = function(node, st, c) {
    c(node.test, st, "Expression");
    c(node.consequent, st, "Statement");
    if (node.alternate) c(node.alternate, st, "Statement");
  };
  base.LabeledStatement = function(node, st, c) {
    c(node.body, st, "Statement");
  };
  base.BreakStatement = base.ContinueStatement = ignore;
  base.WithStatement = function(node, st, c) {
    c(node.object, st, "Expression");
    c(node.body, st, "Statement");
  };
  base.SwitchStatement = function(node, st, c) {
    c(node.discriminant, st, "Expression");
    for (var i = 0; i < node.cases.length; ++i) {
      var cs = node.cases[i];
      if (cs.test) c(cs.test, st, "Expression");
      for (var j = 0; j < cs.consequent.length; ++j)
        c(cs.consequent[j], st, "Statement");
    }
  };
  base.ReturnStatement = base.YieldExpression = function(node, st, c) {
    if (node.argument) c(node.argument, st, "Expression");
  };
  base.ThrowStatement = base.SpreadElement = function(node, st, c) {
    c(node.argument, st, "Expression");
  };
  base.TryStatement = function(node, st, c) {
    c(node.block, st, "Statement");
    if (node.handler) c(node.handler.body, st, "ScopeBody");
    if (node.finalizer) c(node.finalizer, st, "Statement");
  };
  base.WhileStatement = function(node, st, c) {
    c(node.test, st, "Expression");
    c(node.body, st, "Statement");
  };
  base.DoWhileStatement = base.WhileStatement;
  base.ForStatement = function(node, st, c) {
    if (node.init) c(node.init, st, "ForInit");
    if (node.test) c(node.test, st, "Expression");
    if (node.update) c(node.update, st, "Expression");
    c(node.body, st, "Statement");
  };
  base.ForInStatement = base.ForOfStatement = function(node, st, c) {
    c(node.left, st, "ForInit");
    c(node.right, st, "Expression");
    c(node.body, st, "Statement");
  };
  base.ForInit = function(node, st, c) {
    if (node.type == "VariableDeclaration") c(node, st);
    else c(node, st, "Expression");
  };
  base.DebuggerStatement = ignore;

  base.FunctionDeclaration = function(node, st, c) {
    c(node, st, "Function");
  };
  base.VariableDeclaration = function(node, st, c) {
    for (var i = 0; i < node.declarations.length; ++i) {
      var decl = node.declarations[i];
      if (decl.init) c(decl.init, st, "Expression");
    }
  };

  base.Function = function(node, st, c) {
    c(node.body, st, "ScopeBody");
  };
  base.ScopeBody = function(node, st, c) {
    c(node, st, "Statement");
  };

  base.Expression = skipThrough;
  base.ThisExpression = ignore;
  base.ArrayExpression = function(node, st, c) {
    for (var i = 0; i < node.elements.length; ++i) {
      var elt = node.elements[i];
      if (elt) c(elt, st, "Expression");
    }
  };
  base.ObjectExpression = function(node, st, c) {
    for (var i = 0; i < node.properties.length; ++i)
      c(node.properties[i], st);
  };
  base.FunctionExpression = base.ArrowFunctionExpression = base.FunctionDeclaration;
  base.SequenceExpression = base.TemplateLiteral = function(node, st, c) {
    for (var i = 0; i < node.expressions.length; ++i)
      c(node.expressions[i], st, "Expression");
  };
  base.UnaryExpression = base.UpdateExpression = function(node, st, c) {
    c(node.argument, st, "Expression");
  };
  base.BinaryExpression = base.AssignmentExpression = base.LogicalExpression = function(node, st, c) {
    c(node.left, st, "Expression");
    c(node.right, st, "Expression");
  };
  base.ConditionalExpression = function(node, st, c) {
    c(node.test, st, "Expression");
    c(node.consequent, st, "Expression");
    c(node.alternate, st, "Expression");
  };
  base.NewExpression = base.CallExpression = function(node, st, c) {
    c(node.callee, st, "Expression");
    if (node.arguments) for (var i = 0; i < node.arguments.length; ++i)
      c(node.arguments[i], st, "Expression");
  };
  base.MemberExpression = function(node, st, c) {
    c(node.object, st, "Expression");
    if (node.computed) c(node.property, st, "Expression");
  };
  base.Identifier = base.Literal = base.ExportDeclaration = base.ImportDeclaration = ignore;

  base.TaggedTemplateExpression = function(node, st, c) {
    c(node.tag, st, "Expression");
    c(node.quasi, st);
  };
  base.ClassDeclaration = base.ClassExpression = function(node, st, c) {
    if (node.superClass) c(node.superClass, st, "Expression");
    for (var i = 0; i < node.body.body.length; i++)
      c(node.body.body[i], st);
  };
  base.MethodDefinition = base.Property = function(node, st, c) {
    if (node.computed) c(node.key, st, "Expression");
    c(node.value, st, "Expression");
  };
  base.ComprehensionExpression = function(node, st, c) {
    for (var i = 0; i < node.blocks.length; i++)
      c(node.blocks[i].right, st, "Expression");
    c(node.body, st, "Expression");
  };

  // NOTE: the stuff below is deprecated, and will be removed when 1.0 is released

  // A custom walker that keeps track of the scope chain and the
  // variables defined in it.
  function makeScope(prev, isCatch) {
    return {vars: Object.create(null), prev: prev, isCatch: isCatch};
  }
  function normalScope(scope) {
    while (scope.isCatch) scope = scope.prev;
    return scope;
  }
  exports.scopeVisitor = exports.make({
    Function: function(node, scope, c) {
      var inner = makeScope(scope);
      for (var i = 0; i < node.params.length; ++i)
        inner.vars[node.params[i].name] = {type: "argument", node: node.params[i]};
      if (node.id) {
        var decl = node.type == "FunctionDeclaration";
        (decl ? normalScope(scope) : inner).vars[node.id.name] =
          {type: decl ? "function" : "function name", node: node.id};
      }
      c(node.body, inner, "ScopeBody");
    },
    TryStatement: function(node, scope, c) {
      c(node.block, scope, "Statement");
      if (node.handler) {
        var inner = makeScope(scope, true);
        inner.vars[node.handler.param.name] = {type: "catch clause", node: node.handler.param};
        c(node.handler.body, inner, "ScopeBody");
      }
      if (node.finalizer) c(node.finalizer, scope, "Statement");
    },
    VariableDeclaration: function(node, scope, c) {
      var target = normalScope(scope);
      for (var i = 0; i < node.declarations.length; ++i) {
        var decl = node.declarations[i];
        target.vars[decl.id.name] = {type: "var", node: decl.id};
        if (decl.init) c(decl.init, scope, "Expression");
      }
    }
  });

});

},{}],3:[function(require,module,exports){
(function() {
  "use strict";

  var URL = require('./url');

  function File(fileUrl, baseUrl) {
    this.url = new URL(fileUrl, baseUrl);
  }

  /**
   * Build and file object with the important pieces
   */
  File.parseParts = function (fileString) {
    var name;
    var directory = fileString.replace(/([^/]+)$/gmi, function(match) {name = match;return "";});

    return {
      name: name || "",
      directory: directory,
      path: fileString
    };
  };

  /**
   * Method to add an extension if one does not exist in the fileString.  It does NOT replace
   * the file extension if one already exists in `fileString`.
   *
   * @param {string} fileString - File string to add the extension to if one does not exist
   * @param {string} extension - Extension to add if one does not exist in `fileString`. The
   *   value is the extension without the `.`. E.g. `js`, `html`.  Not `.js`, `.html`.
   * @returns {string} New fileString with the new extension if one did not exist
   */
  File.addExtension = function(fileString, extension) {
    var fileName  = File.parseParts(fileString),
        fileParts = fileName.name.split(".");

    if (fileParts.length === 1 && extension) {
      fileParts.push(extension);
    }

    return fileName.directory + fileParts.join(".");
  };

  /**
   * Method to replace an extension, if one does not exist in the file string, it will be added.
   *
   * @param {string} fileString - File string to add the extension to if one does not exist
   * @param {string} extension - Extension to be either added to `fileString` or to replace the extension in `fileString`. The
   *   value is the extension without the `.`. E.g. `js`, `html`.  Not `.js`, `.html`.
   * @returns {string} fileString with the new extension
   */
  File.replaceExtension = function(fileString, extension) {
    var regex = /([^.\/\\]+\.)[^.]+$/;
    if (fileString.match(regex)) {
      return fileString.replace(regex, "$1" + extension);
    }
    else {
      return fileString + "." + extension;
    }
  };

  module.exports = File;
})();

},{"./url":5}],4:[function(require,module,exports){
(function() {
  "use strict";

  var File = require('./file'),
      URL  = require('./url');

  /**
   * @constructor
   * Provides a way to build a module meta object from a module name.  The resolution
   * relies on configuration settings, which are compatible with requirejs. The created
   * module meta objects contain information such as a url that can be used for downloading
   * the corresponding file from a remote sever.
   */
  function Resolver(options) {
    this.settings = options || {};
    var baseUrl = this.settings.baseUrl || (this.settings.baseUrl = ".");

    // Make sure that if a baseUrl is provided, it ends in a slash.  This is to ensure
    // proper creation of URLs.
    if (baseUrl && baseUrl[baseUrl.length - 1] !== '/') {
      this.settings.baseUrl = baseUrl + '/';
    }
  }

  /**
   * Creates a module meta from a module name/id.
   *
   * @param {string} name - Module name/id
   * @param {string} baseUrl - base url to be used when the `name` starts with `./`, `../`, or a protocol.
   *   Otherwise the configured baseUrl is used.
   *
   * @returns {{name: string, file: File, urlArgs: string, shim: object}}
   */
  Resolver.prototype.resolve = function(name, baseUrl) {
    var i, length, file, pkg, pkgParts, pkgName, pkgTarget, shim;
    var settings = this.settings,
        urlArgs  = settings.urlArgs,
        shims    = settings.shim || {},
        packages = settings.packages || [],
        paths    = settings.paths || {},
        fileName = paths[name],
        plugins  = name.split("!");

    // The last item is the actual module name.
    name      = plugins.pop();
    pkgParts  = name.replace(/[\/\\]+/g, "/").split("/");
    pkgName   = pkgParts.shift();
    pkgTarget = pkgParts.join("/");

    // Go through the packages and figure if the module is actually configured as such.
    for (i = 0, length = packages.length; i < length; i++) {
      pkg = packages[i];

      if (pkg === pkgName) {
        fileName = pkgName + "/" + "main";
        break;
      }
      else if (pkg.name === pkgName) {
        fileName = pkg.location ? (pkg.location + "/") : "";
        fileName += pkgName + "/" + (pkgTarget || (pkg.main || "main"));
        break;
      }
    }

    if (shims.hasOwnProperty(name)) {
      shim = {
        name: shims[name].exports || shims[name].name || name,
        deps: shims[name].imports || shims[name].deps || []
      };
    }

    if (!fileName) {
       fileName = name;
    }

    // Let's assume .js extension for everything that is not defined with plugins
    if (plugins.length === 0 && /\.js$/.test(fileName) === false) {
      fileName += ".js";
    }

    baseUrl = Resolver.useBase(fileName) && baseUrl ? baseUrl : settings.baseUrl;
    file    = new File(urlArgs ? fileName + "?" + urlArgs : fileName, baseUrl);

    return {
      name: name,
      file: file, // Deprecated in favor of `url`
      url: file.url,
      shim: shim,
      plugins: plugins
    };
  };


  /**
   * Checks and returns true if name starts with `./`, `../`, or a protocol.  Otherwise returns false;
   */
  Resolver.useBase = function(name) {
    return (name[0] === '.' && (name[1] === '/' || (name[1] === '.' && name[2] === '/'))) || Resolver.hasProtocol(name);
  };


  /**
   * Quick check to determine if the name has a known protocol. Currently we only support http(s) and file.
   */
  Resolver.hasProtocol = function(name) {
    return /^(?:(https?|file)(:\/\/\/?))/g.test(name);
  };


  Resolver.File = Resolver.prototype.File = File;
  Resolver.URL  = Resolver.prototype.URL  = URL;
  module.exports = Resolver;
})();

},{"./file":3,"./url":5}],5:[function(require,module,exports){
(function() {
  "use strict";

  var parser = require('url');

  /**
   * @constructor
   * Constructor for creating URL object as defined here https://developer.mozilla.org/en-US/docs/Web/API/URL
   */
  function URL(urlString, baseString) {
    var resolved = URL.parser.resolve(baseString || "", urlString);
    var url      = URL.parser.parse(resolved);

    if (url.auth) {
      var authParts = url.auth.split(":");
      url.username = authParts[0];
      url.password = authParts[1];
    }

    this.hash     = url.hash || "";
    this.host     = url.host || "";
    this.hostname = url.hostname || "";
    this.href     = url.href;
    this.origin   = url.protocol ? (url.protocol + "//" + url.host) : "";
    this.password = url.password || "";
    this.pathname = url.pathname || "";
    this.port     = url.port || "";
    this.protocol = url.protocol || "";
    this.search   = url.search || "";
    this.username = url.username || "";
  }

  URL.factory = function(url, base) {
    return new URL(url, base);
  };

  URL.parser = parser;
  module.exports = URL;
})();

},{"url":28}],6:[function(require,module,exports){
(function (process){
/**
 * spromise Copyright (c) 2014 Miguel Castillo.
 * Licensed under MIT
 *
 * https://github.com/MiguelCastillo/spromise
 */

/**
 * spromise Copyright (c) 2014 Miguel Castillo.
 * Licensed under MIT
 */

(function(e,t){typeof require=="function"&&typeof exports=="object"&&typeof module=="object"?module.exports=t():typeof define=="function"&&define.amd?define(t):e.spromise=t()})(this,function(){var e,t;return function(){function i(e){return typeof e.factory=="function"?t(e.deps,e.factory):e.factory}function s(e,t){var n,s,o,u,a=[];for(n=0,s=e.length;n<s;n++){o=e[n],u=r[o]||t[o];if(!u)throw new TypeError("Module "+o+" has not yet been loaded");r[o]?(u.hasOwnProperty("code")||(u.code=i(u)),a[n]=u.code):a[n]=u}return a}var n=this,r={};t=function o(e,t){var i,u,a={};return a.require=o,a.exports={},a.module={exports:a.exports},typeof e=="string"&&(i=e,e=[e]),e.length&&(e=s(e.slice(0),a)),typeof t=="function"?u=t.apply(n,e):u=r[i]?r[i].code:t,u===void 0?a.module.exports:u},e=function(t,n,i){r[t]={name:t,deps:n,factory:i}}}.call(this),e("src/samdy",function(){}),e("src/async",["require","exports","module"],function(e,t,n){function i(e){r(e)}var r;i.delay=function(e,t,n){setTimeout(e.apply.bind(e,this,n||[]),t)},typeof process=="object"&&typeof process.nextTick=="function"?r=process.nextTick:typeof setImmediate=="function"?r=setImmediate:r=function(e){setTimeout(e,0)},i.nextTick=r,n.exports=i}),e("src/promise",["require","exports","module","src/async"],function(e,t,n){function o(e,t){t=t||new u;var n=this;n.then=function(e,n){return t.then(e,n)},n.resolve=function(){return t.transition(i.resolved,arguments,this),n},n.reject=function(){return t.transition(i.rejected,arguments,this),n},n.promise={then:n.then,always:n.always,done:n.done,"catch":n.fail,fail:n.fail,notify:n.notify,state:n.state,constructor:o},n.promise.promise=n.promise,n.then.stateManager=t,e&&e.call(n,n.resolve,n.reject)}function u(e){this.state=i.pending,e&&e.state&&this.transition(e.state,e.value,e.context)}function a(e){this.promise=e.promise}function l(e){c.debug&&(console.error(e),e&&e.stack&&console.log(e.stack))}function c(e){return new o(e)}var r=e("src/async"),i={pending:0,resolved:1,rejected:2,always:3,notify:4},s=["pending","resolved","rejected"];o.prototype.done=function(e){return this.then.stateManager.enqueue(i.resolved,e),this.promise},o.prototype.catch=o.prototype.fail=function(e){return this.then.stateManager.enqueue(i.rejected,e),this.promise},o.prototype.finally=o.prototype.always=function(e){return this.then.stateManager.enqueue(i.always,e),this.promise},o.prototype.notify=function(e){return this.then.stateManager.enqueue(i.notify,e),this.promise},o.prototype.state=function(){return s[this.then.stateManager.state]},o.prototype.isPending=function(){return this.then.stateManager.state===i.pending},o.prototype.isResolved=function(){return this.then.stateManager.state===i.resolved},o.prototype.isRejected=function(){return this.then.stateManager.state===i.resolved},o.prototype.delay=function(t){var n=this;return new o(function(e,i){n.then(function(){r.delay(e.bind(this),t,arguments)},i.bind(this))})},u.prototype.enqueue=function(e,t){function r(){n.state===e||i.always===e?t.apply(n.context,n.value):i.notify===e&&t.call(n.context,n.state,n.value)}this.state?f.asyncTask(r):(this.queue||(this.queue=[])).push(r);var n=this},u.prototype.transition=function(e,t,n){if(this.state)return;this.state=e,this.context=n,this.value=t;var r=this.queue;r&&(this.queue=null,f.asyncQueue(r))},u.prototype.then=function(e,t){var n=this;e=e&&typeof e=="function"?e:null,t=t&&typeof t=="function"?t:null;if(!e&&n.state===i.resolved||!t&&n.state===i.rejected)return new o(null,n);var r=new o;return n.enqueue(i.notify,function(s,o){var f=s===i.resolved?e||t:t||e;f&&(o=u.runHandler(s,o,this,r,f)),o!==!1&&(new a({promise:r})).finalize(s,o,this)}),r},u.runHandler=function(e,t,n,r,i){try{t=i.apply(n,t)}catch(s){return l(s),r.reject.call(n,s),!1}return t===undefined?[]:[t]},a.prototype.finalize=function(e,t,n){var r=this,s=this.promise,u,a;if(t.length){u=t[0];if(u===s)a=s.reject.call(n,new TypeError("Resolution input must not be the promise being resolved"));else if(u&&u.constructor===o)a=u.notify(function(t,n){r.finalize(t,n,this)});else if(u!==undefined&&u!==null)switch(typeof u){case"object":case"function":a=this.runThenable(u,n)}}a||(e===i.resolved?s.resolve.apply(n,t):s.reject.apply(n,t))},a.prototype.runThenable=function(e,t){var n=this,r=!1;try{var s=e.then;if(typeof s=="function")return s.call(e,function(){r||(r=!0,n.finalize(i.resolved,arguments,this))},function(){r||(r=!0,n.promise.reject.apply(this,arguments))}),!0}catch(o){return r||n.promise.reject.call(t,o),!0}return!1};var f={_asyncQueue:[],asyncTask:function(e){f._asyncQueue.push(e)===1&&r(f.taskRunner(f._asyncQueue))},asyncQueue:function(e){e.length===1?f.asyncTask(e[0]):f.asyncTask(f.taskRunner(e))},taskRunner:function(e){return function(){var n;while(n=e[0])f._runTask(n),e.shift()}},_runTask:function(e){try{e()}catch(t){l(t)}}};c.prototype=o.prototype,c.defer=function(){return new o},c.reject=function(){return new o(null,new u({context:this,value:arguments,state:i.rejected}))},c.resolve=c.thenable=function(e){if(e){if(e.constructor===o)return e;if(typeof e.then=="function")return new o(e.then)}return new o(null,new u({context:this,value:arguments,state:i.resolved}))},c.delay=function(t){var n=Array.prototype.slice(arguments,1);return new o(function(e){r.delay(e.bind(this),t,n)})},c.states=i,c.debug=!1,n.exports=c}),e("src/all",["require","exports","module","src/promise","src/async"],function(e,t,n){function s(e,t,n){return typeof e=="function"?e.apply(n,t||[]):e}function o(e){function a(){u--,u||n.resolve.call(o,t)}function f(e){return function(){t[e]=arguments.length===1?arguments[0]:arguments,a()}}function l(){var r,i,o;for(r=0,o=u;r<o;r++)i=e[r],i&&typeof i.then=="function"?i.then(f(r),n.reject):(t[r]=s(i),a())}e=e||[];var t=[],n=r.defer(),o=this,u=e.length;return e.length?(i(l),n):n.resolve(e)}var r=e("src/promise"),i=e("src/async");n.exports=o}),e("src/when",["require","exports","module","src/promise","src/all"],function(e,t,n){function s(){var e=this,t=arguments;return new r(function(n,r){i.call(e,t).then(function(t){n.apply(e,t)},function(t){r.call(e,t)})})}var r=e("src/promise"),i=e("src/all");n.exports=s}),e("src/race",["require","exports","module","src/promise"],function(e,t,n){function i(e){return e?new r(function(t,n){function o(){s||(s=!0,t.apply(this,arguments))}function u(){s||(s=!0,n.apply(this,arguments))}var r,i,s=!1;for(r=0,i=e.length;r<i;r++)e[r].then(o,u)}):r.resolve()}var r=e("src/promise");n.exports=i}),e("src/spromise",["require","exports","module","src/promise","src/async","src/when","src/all","src/race"],function(e,t,n){var r=e("src/promise");r.aync=e("src/async"),r.when=e("src/when"),r.all=e("src/all"),r.race=e("src/race"),n.exports=r}),t("src/spromise")});
}).call(this,require('_process'))
},{"_process":23}],7:[function(require,module,exports){
(function () {
  "use strict";

  var Promise    = require('spromise'),
      Utils      = require('./utils'),
      Logger     = require('./logger'),
      Fetch      = require('./fetch'),
      Import     = require('./import'),
      Loader     = require('./loader'),
      Module     = require('./module'),
      Registry   = require('./registry'),
      Middleware = require('./middleware');

  var registryId = 0;
  function getRegistryId() {
    return 'bitloader-' + registryId++;
  }

  var ModuleState = {
    LOADED: "loaded"
  };


  /**
   * @class
   *
   * Facade for relevant interfaces to register and import modules
   */
  function Bitloader(options, factories) {
    options   = options   || {};
    factories = factories || {};

    this.context   = Registry.getById(getRegistryId());
    this.transform = Middleware.factory(this);
    this.plugin    = Middleware.factory(this);

    if (options.transforms) {
      this.transform(options.transforms);
    }

    if (options.plugins) {
      this.plugin(options.plugins);
    }

    // Override any of these factories if you need specialized implementation
    var providers = {
      fetcher  : factories.fetch  ? factories.fetch(this)  : new Bitloader.Fetch(this),
      loader   : factories.loader ? factories.loader(this) : new Bitloader.Loader(this),
      importer : factories.import ? factories.import(this) : new Bitloader.Import(this)
    };

    // Public Interface
    this.providers = providers;
    this.fetch     = providers.fetcher.fetch.bind(providers.fetcher);
    this.load      = providers.loader.load.bind(providers.loader);
    this.register  = providers.loader.register.bind(providers.loader);
    this.import    = providers.importer.import.bind(providers.importer);
  }


  /**
   * Clears the context, which means that all cached modules and other pertinent data
   * will be deleted.
   */
  Bitloader.prototype.clear = function() {
    this.context.clear();
  };


  /**
   * Checks if the module instance is in the module registry
   */
  Bitloader.prototype.hasModule = function(name) {
    return this.context.hasModule(name) || this.providers.loader.isLoaded(name);
  };


  /**
   * Returns the module instance if one exists.  If the module instance isn't in the
   * module registry, then a TypeError exception is thrown
   */
  Bitloader.prototype.getModule = function(name) {
    if (!this.hasModule(name)) {
      throw new TypeError("Module `" + name + "` has not yet been loaded");
    }

    if (!this.context.hasModule(name)) {
      return this.context.setModule(ModuleState.LOADED, name, this.providers.loader.syncBuildModule(name));
    }

    return this.context.getModule(name);
  };


  /**
   * Add a module instance to the module registry.  And if the module already exists in
   * the module registry, then a TypeError exception is thrown.
   *
   * @param {Module} mod - Module instance to add to the module registry
   *
   * @returns {Module} Module instance added to the registry
   */
  Bitloader.prototype.setModule = function(mod) {
    var name = mod.name;

    if (!(mod instanceof(Module))) {
      throw new TypeError("Module `" + name + "` is not an instance of Module");
    }

    if (!name || typeof(name) !== 'string') {
      throw new TypeError("Module must have a name");
    }

    if (this.context.hasModule(name)) {
      throw new TypeError("Module instance `" + name + "` already exists");
    }

    return this.context.setModule(ModuleState.LOADED, name, mod);
  };


  /**
   * Interface to delete a module from the registry.
   *
   * @param {string} name - Name of the module to delete
   *
   * @returns {Module} Deleted module
   */
  Bitloader.prototype.deleteModule = function(name) {
    if (!this.context.hasModule(name)) {
      throw new TypeError("Module instance `" + name + "` does not exists");
    }

    return this.context.deleteModule(name);
  };


  /**
   * Returns the module code from the module registry. If the module code has not
   * yet been fully compiled, then we defer to the loader to build the module and
   * return the code.
   *
   * @param {string} name - The name of the module code to get from the module registry
   *
   * @return {object} The module code.
   */
  Bitloader.prototype.getModuleCode = function(name) {
    if (!this.hasModule(name)) {
      throw new TypeError("Module `" + name + "` has not yet been loaded");
    }

    return this.getModule(name).code;
  };


  /**
   * Sets module evaluated code directly in the module registry.
   *
   * @param {string} name - The name of the module, which is used by other modules
   *  that need it as a dependency.
   * @param {object} code - The evaluated code to be set
   *
   * @returns {object} The evaluated code.
   */
  Bitloader.prototype.setModuleCode = function(name, code) {
    if (this.hasModule(name)) {
      throw new TypeError("Module code for `" + name + "` already exists");
    }

    var mod = new Module({
      name: name,
      code: code
    });

    return this.setModule(mod).code;
  };


  /**
   * Checks is the module has been fully finalized, which is when the module instance
   * get stored in the module registry
   */
  Bitloader.prototype.isModuleCached = function(name) {
    return this.context.hasModule(name);
  };


  Bitloader.prototype.Promise    = Promise;
  Bitloader.prototype.Module     = Module;
  Bitloader.prototype.Utils      = Utils;
  Bitloader.prototype.Logger     = Logger;
  Bitloader.prototype.Middleware = Middleware;

  // Expose constructors and utilities
  Bitloader.Promise    = Promise;
  Bitloader.Utils      = Utils;
  Bitloader.Registry   = Registry;
  Bitloader.Loader     = Loader;
  Bitloader.Import     = Import;
  Bitloader.Module     = Module;
  Bitloader.Fetch      = Fetch;
  Bitloader.Middleware = Middleware;
  Bitloader.Logger     = Logger;
  module.exports       = Bitloader;
})();

},{"./fetch":8,"./import":9,"./loader":10,"./logger":11,"./middleware":16,"./module":17,"./registry":20,"./utils":22,"spromise":6}],8:[function(require,module,exports){
(function() {
  "use strict";

  function Fetch() {
  }

  Fetch.prototype.fetch = function(/*name*/) {
    throw new TypeError("Not implemented, must be implemented by the consumer code");
  };

  module.exports = Fetch;
})();

},{}],9:[function(require,module,exports){
(function() {
  "use strict";

  var Promise  = require('spromise'),
      Registry = require('./registry'),
      Utils    = require('./utils');

  var registryId = 0;
  function getRegistryId() {
    return 'import-' + registryId++;
  }


  var ModuleState = {
    LOADING: "loading"
  };


  /**
   * Module importer.  Primary function is to load Module instances and resolving
   * their dependencies in order to make the Module fully consumable.
   */
  function Import(manager) {
    if (!manager) {
      throw new TypeError("Must provide a manager");
    }

    this.manager = manager;
    this.context = Registry.getById(getRegistryId());
  }


  /**
   * Import is the method to load a Module
   *
   * @param {Array<string> | string} names - module(s) to import
   *
   * @returns {Promise}
   */
  Import.prototype.import = function(names, options) {
    options = options || {};
    var importer = this;

    // Coerce string to array to simplify input processing
    if (typeof(names) === "string") {
      names = [names];
    }

    return new Promise(function deferredModuleImport(resolve, reject) {
      // Callback when modules are loaded
      function modulesLoaded(modules) {
        resolve.apply((void 0), modules);
      }

      // Callback if there was an error loading the modules
      function handleError(error) {
        reject.call((void 0), Utils.printError(error));
      }

      // Load modules
      Promise
        .all(importer._getModules(names, options))
        .then(modulesLoaded, handleError);
    });
  };


  /**
   * Loops through the array of names, loading whatever has not yet been loaded,
   * and returning what has already been loaded.
   *
   * @param {Array<string>} names - Array of module names
   * @param {Object} options
   */
  Import.prototype._getModules = function(names, options) {
    var importer = this,
        manager  = this.manager;

    return names.map(function getModule(name) {
      if (hasModule(options.modules, name)) {
        return options.modules[name];
      }
      else if (manager.hasModule(name)) {
        return manager.getModuleCode(name);
      }
      else if (importer.hasModule(name)) {
        return importer.getModule(name);
      }

      // Workflow for loading a module that has not yet been loaded
      return new Promise(function(resolve, reject) {
        importer.setModule(name, importer._loadModule(name))
          .then(function success(val) {
            resolve(val);
          }, function failed(err) {
            reject(err);
          });
      });
    });
  };


  /**
   * Load module
   */
  Import.prototype._loadModule = function(name) {
    return this.manager
      .load(name)
      .then(this._getModuleCode(name), Utils.forwardError);
  };


  /**
   * Handler for when modules are loaded.
   */
  Import.prototype._getModuleCode = function(name) {
    var importer = this;

    return function getCode(mod) {
      if (name !== mod.name) {
        throw new TypeError("Module name must be the same as the name used for loading the Module itself");
      }

      importer.deleteModule(mod.name);
      return importer.manager.getModuleCode(mod.name);
    };
  };


  function hasModule(target, name) {
    return target && target.hasOwnProperty(name);
  }

  Import.prototype.hasModule = function(name) {
    return this.context.hasModuleWithState(ModuleState.LOADING, name);
  };

  Import.prototype.getModule = function(name) {
    return this.context.getModuleWithState(ModuleState.LOADING, name);
  };

  Import.prototype.setModule = function(name, item) {
    return this.context.setModule(ModuleState.LOADING, name, item);
  };

  Import.prototype.deleteModule = function(name) {
    return this.context.deleteModule(name);
  };

  module.exports = Import;
})();


},{"./registry":20,"./utils":22,"spromise":6}],10:[function(require,module,exports){
(function() {
  "use strict";

  var Promise          = require('spromise'),
      Module           = require('./module'),
      Utils            = require('./utils'),
      Pipeline         = require('./pipeline'),
      Registry         = require('./registry'),
      moduleLinker     = require('./module/linker'),
      metaFetch        = require('./meta/fetch'),
      metaTransform    = require('./meta/transform'),
      metaDependencies = require('./meta/dependencies'),
      metaCompilation  = require('./meta/compilation');


  var registryId = 0;
  function getRegistryId() {
    return 'loader-' + registryId++;
  }


  /**
   * - Loaded means that the module meta is all processed and it is ready to be
   *  built into a Module instance. Only for SYNC processing.
   *
   * - Pending means that the module meta is already loaded, but it needs it's
   *  dependencies processed, which might lead to further loading of module meta
   *  objects. Only for ASYNC processing.
   *
   * - Loading means that the module meta is currently being loaded. Only for ASYNC
   *  processing.
   */
  var ModuleState = {
    LOADING: "loading",
    LOADED:  "loaded",
    PENDING: "pending"
  };


  /**
   * The purpose of Loader is to return full instances of Module.  Module instances
   * are stored in the manager's context to avoid loading the same module multiple times.
   * If the module is loaded, then we just return that.  If it has not bee loaded yet,
   * then we:
   *
   * 1. Fetch its source; remote server, local file system... You must specify a fetch
   *      provider to define how source files are retrieved
   * 2. Transform the source that was fetched.  This step enables processing of the
   *      source before it is compiled into an instance of Module.
   * 3. Compile the source that was fetched and transformed into a proper instance
   *      of Module
   */
  function Loader(manager) {
    if (!manager) {
      throw new TypeError("Must provide a manager");
    }

    this.manager  = manager;
    this.context  = Registry.getById(getRegistryId());
    this.pipeline = new Pipeline([metaTransform, metaDependencies]);
  }


  /**
   * Handles the process of returning the instance of the Module if one exists, otherwise
   * the workflow for creating the instance is kicked off, which will eventually lead to
   * the creation of a Module instance
   *
   * The workflow is to take in a module name that needs to be loaded.  If a module with
   * the given name isn't loaded, then we fetch it.  The fetch call returns a promise, which
   * when resolved returns a moduleMeta. The moduleMeta is an intermediate object that contains
   * the module source from fetch and a compile method used for converting the source to an
   * instance of Module. The purporse for moduleMeta is to allow a tranformation pipeline to
   * process the raw source before building the final product - a Module instance. The
   * transformation pipeline allows us to do things like convert coffeescript to javascript.
   *
   * Primary workflow:
   * fetch     -> module name {string}
   * transform -> module meta {compile:fn, source:string}
   * load deps -> module meta {compile:fn, source:string}
   * compile moduleMeta
   * link module
   *
   * @param {string} name - The name of the module to load.
   *
   * @returns {Promise} - Promise that will resolve to a Module instance
   */
  Loader.prototype.load = function(name, parentMeta) {
    var loader  = this,
        manager = this.manager;

    if (!name) {
      return Promise.reject(new TypeError("Must provide the name of the module to load"));
    }

    if (manager.hasModule(name)) {
      return Promise.resolve(manager.getModule(name));
    }

    if (loader.isLoaded(name) || loader.isPending(name)) {
      return Promise.resolve(buildModule());
    }

    return loader
      .fetch(name, parentMeta)
      .then(buildModule, Utils.forwardError);

    function buildModule() {
      return loader.asyncBuildModule(name);
    }
  };


  /**
   * This method fetches the module meta if it is not already loaded. Once the
   * the module meta is fetched, it is put through the transform pipeline. Once
   * the transformation is done, all dependencies are fetched.
   *
   * The purpose for this method is to setup the module meta and all its dependencies
   * so that the module meta can be converted to an instance of Module synchronously.
   *
   * Use this method if the intent is to preload dependencies without actually compiling
   * module metas to instances of Module.
   *
   * @param {string} name - The name of the module to fetch
   * @returns {Promise}
   */
  Loader.prototype.fetch = function(name, parentMeta) {
    var loader  = this,
        manager = this.manager;

    if (!name) {
      return Promise.reject(new TypeError("Must provide the name of the module to fetch"));
    }

    if (manager.hasModule(name)) {
      return Promise.resolve();
    }

    if (loader.isLoading(name)) {
      return loader.getLoading(name);
    }

    var loading = loader
      ._fetchModuleMeta(name, parentMeta)
      .then(moduleMetaReady, Utils.printError);

    return loader.setLoading(name, loading);

    function moduleMetaReady(moduleMeta) {
      loader.setLoaded(name, moduleMeta);
    }
  };


  /**
   * Converts a module meta object to a full Module instance.
   *
   * @param {string} name - The name of the module meta to convert to an instance of Module.
   *
   * @returns {Module} Module instance from the conversion of module meta
   */
  Loader.prototype.syncBuildModule = function(name) {
    var mod = this._compileModuleMeta(name);

    if (!mod) {
      if (this.isPending(name)) {
        throw new TypeError("Unable to synchronously build dynamic module '" + name + "'");
      }
      else {
        throw new TypeError("Unable to synchronously build module '" + name + "'");
      }
    }

    return this._linkModule(mod);
  };


  /**
   * Build module handling any async Module registration.  What this means is that if a module
   * is being loaded and it calls System.register to register itself, then it needs to be handled
   * as an async step because that could be loading other dependencies.
   *
   * @param {string} name - Name of the target Module
   *
   * @returns {Promise}
   */
  Loader.prototype.asyncBuildModule = function(name) {
    var loader = this;
    var mod;

    if (this.isLoaded(name)) {
      mod = this._compileModuleMeta(name);
    }
    else if (this.manager.hasModule(name)) {
      return Promise.resolve(this.manager.getModule(name));
    }

    // If the module evaluation didn't register a new module, then we return whatever
    // was produced.
    if (!this.isPending(name)) {
      return Promise.resolve(this._linkModule(mod));
    }

    // Right here is where we handle dynamic registration of modules while are being loaded.
    // E.g. System.register to register a module that's being loaded
    return metaDependencies(loader.manager, loader.deleteModule(name))
      .then(buildDependencies, Utils.forwardError)
      .then(linkModuleMeta, Utils.forwardError);


    //
    // Helper methods
    //

    function buildDependencies(moduleMeta) {
      var pending = moduleMeta.deps.map(function buildDependency(moduleName) {
        return loader.asyncBuildModule(moduleName);
      });

      return Promise.all(pending)
        .then(function dependenciesBuilt() {
          return moduleMeta;
        });
    }

    function linkModuleMeta(moduleMeta) {
      return loader._linkModule(new Module(moduleMeta));
    }
  };


  /**
   * Interface to register a module meta that can be put compiled to a Module instance
   */
  Loader.prototype.register = function(name, deps, factory, type) {
    if (this.manager.hasModule(name) || this.hasModule(name)) {
      throw new TypeError("Module '" + name + "' is already loaded");
    }

    this.setPending(name, {
      name    : name,
      deps    : deps,
      factory : factory,
      type    : type
    });
  };


  /**
   * Utility helper that runs a module meta object through the transformation workflow.
   * The module meta object passed *must* have a string source property, which is what
   * the transformation workflow primarily operates against.
   *
   * @param {object} moduleMeta - Module meta object with require `source` property that
   *  is processed by the transformation pipeline.
   *
   * @returns {Promise} That when resolved, the fully tranformed module meta is returned.
   *
   */
  Loader.prototype.transform = function(moduleMeta) {
    if (!moduleMeta) {
      return Promise.reject(new TypeError("Must provide a module meta object"));
    }

    if (typeof(moduleMeta.source) !== "string") {
      throw Promise.reject(new TypeError("Must provide a source string property with the content to transform"));
    }

    moduleMeta.deps = moduleMeta.deps || [];
    return metaTransform(this.manager, moduleMeta);
  };


  /**
   * Calls the fetch provider to get a module meta object, and then puts it through
   * the module meta pipeline
   *
   * @param {string} name - Module name for which to build the module meta for
   * @param {Object} parentMeta - Is the module meta object that is requesting the fetch
   *   transaction, which is important when processing sub dependencies.
   *
   * @returns {Promise} When resolved, a module meta that has gone through the pipeline
   *   is returned.
   */
  Loader.prototype._fetchModuleMeta = function(name, parentMeta) {
    var loader = this;

    // This is where the call to fetch the module meta takes place. Once the
    // module meta is loaded, it is put through the transformation pipeline.
    return metaFetch(this.manager, name, parentMeta)
      .then(pipelineModuleMeta, Utils.forwardError);

    function pipelineModuleMeta(moduleMeta) {
      return loader._pipelineModuleMeta(moduleMeta);
    }
  };


  /**
   * Put a module meta object through the pipeline, which includes the transformation
   * and dependency loading stages.
   *
   * @param {object} moduleMeta - Module meta object to run through the pipeline.
   *
   * @returns {Promise} that when fulfilled, the processed module meta object is returned.
   */
  Loader.prototype._pipelineModuleMeta = function(moduleMeta) {
    if (Module.Meta.isCompiled(moduleMeta)) {
      return Promise.resolve(moduleMeta);
    }

    return this.pipeline
      .run(this.manager, moduleMeta)
      .then(pipelineFinished, Utils.forwardError);

    function pipelineFinished() {
      return moduleMeta;
    }
  };


  /**
   * Convert a module meta object into a proper Module instance.
   *
   * @param {string} name - Name of the module meta object to be converted.
   *
   * @returns {Module}
   */
  Loader.prototype._compileModuleMeta = function(name) {
    var moduleMeta;
    var manager = this.manager;

    if (this.isLoaded(name)) {
      moduleMeta = this.deleteModule(name);
    }
    else if (this.manager.isModuleCached(name)) {
      throw new TypeError("Module `" + name + "` is already loaded, so you can just call `manager.getModule(name)`");
    }
    else {
      throw new TypeError("Module `" + name + "` is not loaded yet. Make sure to call `load` or `fetch` prior to calling `linkModuleMeta`");
    }

    // Compile module meta to create a Module instance
    return metaCompilation(manager, moduleMeta);
  };


  /**
   * Finalizes a Module instance by pulling in all the dependencies and calling the module
   * factory method if available.  This is the very last stage of the Module building process
   *
   * @param {Module} mod - Module instance to link
   *
   * @returns {Module} Instance all linked
   */
  Loader.prototype._linkModule = function(mod) {
    if (!(mod instanceof(Module))) {
      throw new TypeError("Module `" + mod.name + "` is not an instance of Module");
    }

    ////
    // This is the sweet spot when synchronous build process and dynamic module registration meet.
    //
    // Module registration/import are async operations. Build process is sync.  So the challenge
    // is to make sure these two don't cross paths.  We solve this problem by making sure we
    // only process pending module meta objects in async module loading methods such as
    // `import`, because that method is asynchronous.  We want async operations to run early
    // and finish all they work.  And then ONLY run sync operations so that calls like `require`
    // can behave synchronously.
    ////
    if (this.isPending(mod.name)) {
      console.warn("Module '" + mod.name + "' is being dynamically registered while being loaded.", "You don't need to call 'System.register' when the module is already being loaded.");
    }

    // Run the Module instance through the module linker
    return moduleLinker(this.manager, mod);
  };


  /**
   * Check if there is currently a module loading or loaded.
   *
   * @param {string} name - The name of the module meta to check
   *
   * @returns {Boolean}
   */
  Loader.prototype.hasModule = function(name) {
    return this.context.hasModule(name);
  };


  /**
   * Method to retrieve the module meta with the given name, if one exists.  If it
   * is loading, then the promise for the pending request is returned. Otherwise
   * the actual module meta object is returned.
   *
   * @param {string} name - The name of the module meta to get
   *
   * @returns {object | Promise}
   */
  Loader.prototype.getModule = function(name) {
    return this.context.getModule(name);
  };


  /**
   * Checks if the module meta with the given name is currently loading
   *
   * @param {string} name - The name of the module meta to check
   *
   * @returns {Boolean} - true if the module name is being loaded, false otherwise.
   */
  Loader.prototype.isLoading = function(name) {
    return this.context.hasModuleWithState(ModuleState.LOADING, name);
  };


  /**
   * Method to retrieve the module meta with the given name, if it is loading.
   *
   * @param {string} name - The name of the loading module meta to get.
   *
   * @returns {Promise}
   */
  Loader.prototype.getLoading = function(name) {
    return this.context.getModuleWithState(ModuleState.LOADING, name);
  };


  /**
   * Method to set the loading module meta with the given name.
   *
   * @param {string} name - The name of the module meta to set
   * @param {Object} item - The module meta to set
   *
   * @returns {Object} The module meta being set
   */
  Loader.prototype.setLoading = function(name, item) {
    return this.context.setModule(ModuleState.LOADING, name, item);
  };


  /**
   * Method to check if a module meta object is in a pending state, which means
   * that all it needs is have its dependencies loaded and then it's ready to
   * to be compiled.
   *
   * @param {string} name - Name of the module meta object
   *
   * @returns {Boolean}
   */
  Loader.prototype.isPending = function(name) {
    return this.context.hasModuleWithState(ModuleState.PENDING, name);
  };


  /**
   * Method to get a module meta object to the pending state.
   *
   * @param {string} name - Name of the module meta to get
   *
   * @returns {Object} Module meta object
   */
  Loader.prototype.getPending = function(name) {
    return this.context.getModuleWithState(ModuleState.PENDING, name);
  };


  /**
   * Method to set a module meta object to the pending state.
   *
   * @param {string} name - Name of the module meta object
   * @param {Object} item - Module meta object to be set
   *
   * @returns {Object} Module meta being set
   */
  Loader.prototype.setPending = function(name, item) {
    return this.context.setModule(ModuleState.PENDING, name, item);
  };


  /**
   * Method to check if a module meta with the given name is already loaded.
   *
   * @param {string} name - The name of the module meta to check.
   *
   * @returns {Boolean}
   */
  Loader.prototype.isLoaded = function(name) {
    return this.context.hasModuleWithState(ModuleState.LOADED, name);
  };


  /**
   * Method to retrieve the module meta with the given name, if one exists.
   *
   * @param {string} name - The name of the loaded module meta to set
   *
   * @returns {Object} The loaded module meta
   */
  Loader.prototype.getLoaded = function(name) {
    return this.context.getModuleWithState(ModuleState.LOADED, name);
  };


  /**
   * Method to set the loaded module meta with the given name
   *
   * @param {string} name - The name of the module meta to set
   * @param {Object} item - The module meta to set
   *
   * @returns {Object} The module meta being set
   */
  Loader.prototype.setLoaded = function(name, item) {
    return this.context.setModule(ModuleState.LOADED, name, item);
  };


  /**
   * Method to remove the module from storage
   *
   * @param {string} name - The name of the module meta to remove
   *
   * @returns {Object} The module meta being removed
   */
  Loader.prototype.deleteModule = function(name) {
    return this.context.deleteModule(name);
  };


  module.exports = Loader;
})();

},{"./meta/compilation":12,"./meta/dependencies":13,"./meta/fetch":14,"./meta/transform":15,"./module":17,"./module/linker":18,"./pipeline":19,"./registry":20,"./utils":22,"spromise":6}],11:[function(require,module,exports){
(function() {
  "use strict";

  var _enabled = false;
  var _only    = false;
  var noop     = function noop() {};


  /**
   * @class
   * Logger instance with a name
   *
   * @param {string} name - Name of the logger
   */
  function Logger(name, options) {
    options = options || {};
    this.name     = name;
    this._enabled = true;
    this._target  = ensureTarget(options._target);
  }


  /**
   * Helper factory method to create named loggers
   */
  Logger.prototype.factory = function(name, options) {
    return new Logger(name, options);
  };


  /**
   * Method to log a message.
   *
   * Verifies that logger is enabled. If it is enabled, then the message(s) are
   * logged. Otherwise ignored.
   */
  Logger.prototype.log = function() {
    if (!this.isEnabled()) {
      return;
    }

    this._target.log.apply(this._target, [getDate(), this.name].concat(arguments));
  };


  /**
   * Method to log JSON.
   *
   * Verifies that the logger is enabled. If it is enabled, then the input JSON
   * is logged.  Otherwise ignored.
   */
  Logger.prototype.dir = function() {
    if (!this.isEnabled()) {
      return;
    }

    this._target.dir.apply(this._target, arguments);
  };


  /**
   * Method to log errors.
   *
   * Verifies that the logger is enabled. If it is enabled, then the error(s)
   * are logged.  Otherwise ignored.
   */
  Logger.prototype.error = function() {
    if (!this.isEnabled()) {
      return;
    }

    this._target.error.apply(this._target, arguments);
  };


  /**
   * Checks if the logger can write messages.
   *
   * @returns {boolean}
   */
  Logger.prototype.isEnabled = function() {
    return this._enabled && _enabled && (!_only || _only === this.name);
  };


  /**
   * Method to enable the logger intance. If loggers have been disabled
   * globally then this flag will not have an immediate effect, until
   * loggers are globally enabled.
   */
  Logger.prototype.enable = function() {
    this._enabled = true;
  };


  /**
   * Method to disable the logger instance. Like {@link Logger#enable},
   * this setting does not have an immediate effect if loggers are globally
   * disabled.
   */
  Logger.prototype.disable = function() {
    this._enabled = false;
  };


  /**
   * Method to make sure only this logger logs messages. If another logger is
   * set to only, then the request is silently ignored.
   */
  Logger.prototype.only = function() {
    if (!Logger._only) {
      Logger._only = this.name;
    }
  };


  /**
   * Method to remove the logger from the `only` state to allow other loggers
   * set themselves as only.
   */
  Logger.prototype.all = function() {
    Logger._only = null;
  };


  /**
   * Disables loggers globally.
   */
  Logger.prototype.disableAll = function() {
    Logger.disable();
  };


  /**
   * Enables loggers globally.
   */
  Logger.prototype.enableAll = function() {
    Logger.enable();
  };


  // Expose the constructor to be able to create new instances from an
  // existing instance.
  Logger.prototype.Logger = Logger;


  /**
   * Underlying method to enable all logger instances
   *
   * @private
   */
  Logger.enable  = function() {
    _enabled = true;
  };


  /**
   * Underlying method to disable all logger instances
   *
   * @private
   */
  Logger.disable = function() {
    _enabled = false;
  };


  /**
   * Underlying method to set the `only` logger instance that can log message
   *
   * @private
   */
  Logger.only = function(name) {
    _only = name;
  };


  /**
   * Underlying method to remove the `only` logger instance that can log
   * message
   *
   * @private
   */
  Logger.all = function() {
    _only = null;
  };


  /**
   * Returns a valid console interface with three methods:
   * - log, which logs raw text messages.
   * - error, which logs errors including exceptions.
   * - dir, which logs JSON
   *
   * @returns {{log: function, error: function, dir: function}}
   */
  function getConsole() {
    var _result;
    if (typeof(console) !== 'undefined') {
      _result = console;
    }
    else {
      _result = {log: noop, error: noop, dir: noop};
    }
    return _result;
  }


  /**
   * Method that fills in the target object to make sure we have a valid target
   * we are writing to.
   */
  function ensureTarget(target) {
    if (!target) {
      return getConsole();
    }

    target.log   = target.log   || noop;
    target.error = target.error || noop;
    target.dir   = target.dir   || noop;
    return target;
  }


  /**
   * Helper method to get timestamps for logged message
   *
   * @private
   */
  function getDate() {
    return (new Date()).getTime();
  }


  /**
   * Default logger instance available
   */
  module.exports = new Logger();
}());

},{}],12:[function(require,module,exports){
(function() {
  "use strict";

  var Module = require('../module'),
      Logger = require('../logger'),
      logger = Logger.factory("Meta/Compilation");

  /**
   * The compile step is to convert the moduleMeta to an instance of Module. The
   * fetch provider is in charge of adding the compile interface in the moduleMeta
   * as that is the place with the most knowledge about how the module was loaded
   * from the server/local file system.
   */
  function MetaCompilation(manager, moduleMeta) {
    logger.log(moduleMeta.name, moduleMeta);

    var mod;
    if (Module.Meta.canCompile(moduleMeta)) {
      mod = moduleMeta.compile();
    }
    else if (Module.Meta.isCompiled(moduleMeta)) {
      mod = new Module(moduleMeta);
    }

    if (mod) {
      // We will coerce the name no matter what name (if one at all) the Module was
      // created with. This will ensure a consistent state in the loading engine.
      mod.name = moduleMeta.name;

      // Set the mod.meta for convenience
      mod.meta = moduleMeta;
      return mod;
    }
  }

  module.exports = MetaCompilation;
})();

},{"../logger":11,"../module":17}],13:[function(require,module,exports){
(function() {
  "use strict";

  var Promise = require('spromise'),
      Module  = require('../module'),
      Utils   = require('../utils'),
      Logger  = require('../logger'),
      logger  = Logger.factory("Meta/Dependencies");

  /**
   * Loads up all dependencies for the module
   *
   * @returns {Function} callback to call with the Module instance with the
   *   dependencies to be resolved
   */
  function MetaDependencies(manager, moduleMeta) {
    logger.log(moduleMeta.name, moduleMeta);

    // Return if the module has no dependencies
    if (!Module.Meta.hasDependencies(moduleMeta)) {
      return Promise.resolve(moduleMeta);
    }

    var loading = moduleMeta.deps.map(function fetchDependency(mod_name) {
      return manager.providers.loader.fetch(mod_name, moduleMeta);
    });

    return Promise.all(loading)
      .then(dependenciesFetched, Utils.forwardError);

    function dependenciesFetched() {
      return moduleMeta;
    }
  }

  module.exports = MetaDependencies;
})();

},{"../logger":11,"../module":17,"../utils":22,"spromise":6}],14:[function(require,module,exports){
(function() {
  "use strict";

  var Promise = require('spromise'),
      Module  = require('../module'),
      Utils   = require('../utils'),
      Logger  = require('../logger'),
      logger  = Logger.factory("Meta/Fetch");

  function MetaFetch(manager, name, parentMeta) {
    logger.log(name);

    return Promise.resolve(manager.fetch(name, parentMeta))
      .then(moduleFetched, Utils.forwardError);

    // Once the module meta is fetched, we want to add helper properties
    // to it to facilitate further processing.
    function moduleFetched(moduleMeta) {
      if (!(moduleMeta instanceof Module.Meta)) {
        Module.Meta.validate(moduleMeta);
        moduleMeta.deps = moduleMeta.deps || [];
      }

      moduleMeta.name = name;
      return moduleMeta;
    }
  }

  module.exports = MetaFetch;
})();

},{"../logger":11,"../module":17,"../utils":22,"spromise":6}],15:[function(require,module,exports){
(function() {
  "use strict";

  var Utils  = require('../utils'),
      Logger = require('../logger'),
      logger = Logger.factory("Meta/Tranform");

  /**
   * The transform enables transformation providers to process the moduleMeta
   * before it is compiled into an actual Module instance.  This is where steps
   * such as linting and processing coffee files can take place.
   */
  function MetaTransform(manager, moduleMeta) {
    logger.log(moduleMeta.name, moduleMeta);

    return manager.transform.runAll(moduleMeta)
      .then(transformationFinished, Utils.forwardError);

    function transformationFinished() {
      return moduleMeta;
    }
  }

  module.exports = MetaTransform;
})();

},{"../logger":11,"../utils":22}],16:[function(require,module,exports){
(function() {
  "use strict";

  var Promise = require('spromise'),
      Logger  = require('./logger'),
      Utils   = require('./utils');

  var logger = Logger.factory("Middleware");

  /**
   * @constructor For checking middleware provider instances
   */
  function Provider() {
  }


  /**
   * Middleware provides a mechanism for registering `plugins` that can be
   * called in the order in which they are registered.  These middlewares can
   * be module names that can be loaded at runtime or can be functions.
   */
  function Middleware(manager) {
    this.manager   = manager;
    this.providers = [];
    this.named     = {};
  }


  /**
   * Method to register middleware providers.  Providers can be methods, a module
   * name, or an object with a method in it called `handler`.  If the provider is
   * is a module name, then it will be loaded dynamically. These providers will also
   * be registered as `named` providers, which are providers.  Named providers are
   * those that can be executed by name.  For example, you can say `middleware.run("concat");`
   * Registering a provider that is function will just be an `anonymouse` provider
   * and will only execute when running the entire chain of providers.  When passing
   * in an object, you will need to define a method `handler`. But you can optionally
   * pass in a name, which will cause the provider to be registered as a `named`
   * provider.
   *
   * @param {Object | Array<Object>} providers - One or collection of providers to
   *   be registered in this middleware manager instance.
   *
   *
   * For example, the provider below is just a method that will get invoked when
   * running the entire sequence of providers.
   *
   * ``` javascript
   * middleware.use(function() {
   *   console.log("1");
   * });
   * ```
   *
   * But registering a provider as a name will cause the middleware engine to
   * dynamically load it, and can also be executed with `run("concat")` which
   * runs only the provider `concat` rather than the entire chain.
   *
   * ``` javascript
   * middleware.use(`concat`);
   * ```
   *
   * The alternative for registering `named` providers is to pass in a `Object` with a
   * `handler` method and a `name`.  The name is only required if you are interested in
   * more control for executing the provider.
   *
   * ``` javascript
   * middleware.use({
   *  name: "concat",
   *  handler: function() {
   *  }
   * });
   * ```
   */
  Middleware.prototype.use = function(providers) {
    if (!Utils.isArray(providers)) {
      providers = [providers];
    }

    for (var provider in providers) {
      if (providers.hasOwnProperty(provider)) {
        provider = this.configure(providers[provider]);
        this.providers.push(provider);

        if (Utils.isString(provider.name)) {
          this.named[provider.name] = provider;
        }
      }
    }

    return this;
  };


  /**
   * Method that runs `named` providers.  You can pass in a name of the provider
   * to be executed or an array of names.  If passing in an array, the order in
   * array is the order in which they will be ran; regardless of the order in
   * which they were registered.
   *
   * When a provider is executed, it can terminate the execution sequence by
   * returning a value.  You can also `throw` to teminate the execution. Otherwise
   * the sequence will run for as long as no poviders return anything.
   *
   * The only thing a provider can return is a promise, which is really useful
   * if the provider needs to do some work asynchronously.
   *
   * @param {string | Array<string>} names - Name(s) of the providers to run
   *
   * @returns {Promise}
   */
  Middleware.prototype.run = function(names) {
    if (Utils.isString(names)) {
      names = [names];
    }

    if (!Utils.isArray(names)) {
      throw new TypeError("List of handlers must be a string or an array of names");
    }

    var i, length;
    var handlers = [];

    for (i = 0, length = names.length; i < length; i++) {
      handlers.push(this.getProvider(names[i]));
    }

    return _runProviders(handlers, Array.prototype.slice.call(arguments, 1));
  };


  /**
   * Method to run all registered providers in the order in which they were
   * registered.
   *
   * @returns {Promise}
   */
  Middleware.prototype.runAll = function() {
    return _runProviders(this.providers, arguments);
  };


  /**
   * Gets the middleware provider by name.  It also handles when the middlware
   * handler does not exist.
   *
   * @returns {Provider}
   */
  Middleware.prototype.getProvider = function(name) {
    if (!this.named.hasOwnProperty(name)) {
      throw new TypeError("Middleware provider '" + name + "' does not exist");
    }

    return this.named[name];
  };


  /**
   * Method to normalize provider settings to proper provider objects that can
   * be used by the middleware manager.
   */
  Middleware.prototype.configure = function(options) {
    var provider = new Provider();

    if (Utils.isFunction(options)) {
      provider.handler = options;
    }
    else if (Utils.isString(options)) {
      provider.name    = options;
      provider.handler = _deferred(this, provider);
    }
    else if (Utils.isPlainObject(options)) {
      if (!Utils.isFunction(options.handler)) {
        if (!Utils.isString(options.name)) {
          throw new TypeError("Middleware provider must have a handler method or a name");
        }

        provider.handler = _deferred(this, provider);
      }

      Utils.merge(provider, options);
    }

    provider.settings = provider.settings || {};
    return provider;
  };


  /**
   * Convenience method to allow registration of providers by calling the middleware
   * manager itself rather than the use method.
   *
   * E.g.
   *
   * middleware(function() {
   * })
   *
   * vs.
   *
   * middleware.use(function() {
   * });
   *
   */
  Middleware.factory = function(manager) {
    var middleware = new Middleware(manager);

    function instance(provider) {
      middleware.use(provider);
    }

    instance.use    = middleware.use.bind(middleware);
    instance.run    = middleware.run.bind(middleware);
    instance.runAll = middleware.runAll.bind(middleware);
    return Utils.extend(instance, middleware);
  };


  Middleware.Provider = Provider;


  /**
   * @private
   * Method that enables chaining in providers that have to be dynamically loaded.
   */
  function _deferred(middleware, provider) {
    return function deferredTransform() {
      var args = arguments;
      provider.__pending = true;

      logger.log("import [start]", provider);
      provider.handler = middleware.manager.import(provider.name)
        .then(function transformReady(handler) {
          logger.log("import [end]", provider);
          delete provider.__pending;
          provider.handler = handler;
          return handler.apply(provider, args);
        });

      provider.handler.name = provider.name;
      return provider.handler;
    };
  }


  /**
   * @private
   * Method that runs a cancellable sequence of promises.
   */
  function _runProviders(providers, data) {
    var cancelled = false;

    return providers.reduce(function(prev, curr) {
      return prev.then(function(next) {
        if (next === false) {
          cancelled = true;
        }

        if (!cancelled && !curr.__pending) {
          logger.log("transformation", curr.name, data);
          return curr.handler.apply(curr, data);
        }
      }, function(err) {
        cancelled = true;
        return err;
      });
    }, Promise.resolve());
  }


  module.exports = Middleware;
}());

},{"./logger":11,"./utils":22,"spromise":6}],17:[function(require,module,exports){
(function() {
  "use strict";

  var Utils = require('./utils');

  var Type = {
    "UNKNOWN" : "UNKNOWN",
    "AMD"     : "AMD",     //Asynchronous Module Definition
    "CJS"     : "CJS",     //CommonJS
    "IIFE"    : "IIFE"     //Immediately-Invoked Function Expression
  };


  function Module(options) {
    if (!options) {
      throw new TypeError("Must provide options to create the module");
    }

    if (options.hasOwnProperty("code")) {
      this.code = options.code;
    }

    if (options.hasOwnProperty("factory")) {
      this.factory = options.factory;
    }

    this.type     = options.type || Type.UNKNOWN;
    this.name     = options.name;
    this.deps     = options.deps ? options.deps.slice(0) : [];
    this.settings = Utils.extend({}, options);
  }


  function Meta(options) {
    Meta.validate(options);
    Utils.extend(this, options);

    if (!options.deps) {
      this.deps = [];
    }
  }


  Meta.validate = function(moduleMeta) {
    if (!moduleMeta) {
      throw new TypeError("Must provide options");
    }

    if (!Meta.isCompiled(moduleMeta) && !Meta.canCompile(moduleMeta)) {
      throw new TypeError("ModuleMeta must provide a `source` string and `compile` interface, or `code`.");
    }
  };


  Meta.hasDependencies = function(moduleMeta) {
    return moduleMeta.deps && moduleMeta.deps.length;
  };


  Meta.isCompiled = function(moduleMeta) {
    return moduleMeta.hasOwnProperty("code") || typeof(moduleMeta.factory) === "function";
  };


  Meta.canCompile = function(moduleMeta) {
    return !Meta.isCompiled(moduleMeta) && typeof(moduleMeta.source) === "string" && typeof(moduleMeta.compile) === "function";
  };


  Module.Meta = Meta;
  Module.Type = Type;
  module.exports = Module;
})();

},{"./utils":22}],18:[function(require,module,exports){
(function(root) {
  "use strict";

  var Logger = require('../logger'),
      logger = Logger.factory("Module/Linker");

  function ModuleLinker(manager, mod) {
    function traverseDependencies(mod) {
      logger.log(mod.name, mod);

      // Get all dependencies to feed them to the module factory
      var deps = mod.deps.map(function resolveDependency(mod_name) {
        if (manager.isModuleCached(mod_name)) {
          return manager.getModuleCode(mod_name);
        }

        return traverseDependencies(manager.getModule(mod_name)).code;
      });

      if (mod.factory && !mod.hasOwnProperty("code")) {
        mod.code = mod.factory.apply(root, deps);
      }

      return mod;
    }

    return manager.setModule(traverseDependencies(mod));
  }

  module.exports = ModuleLinker;
})(typeof(window) !== 'undefined' ? window : this);

},{"../logger":11}],19:[function(require,module,exports){
(function() {
  "use strict";

  var Promise = require('spromise');

  function Pipeline(assets) {
    this.assets = assets;
  }

  Pipeline.prototype.run = function() {
    var args = arguments;
    function cb(curr) {
      return function pipelineAssetReady() {
        return curr.apply((void 0), args);
      };
    }

    return this.assets.reduce(function(prev, curr) {
      return prev.then(cb(curr), forwardError);
    }, Promise.resolve());
  };

  function forwardError(error) {
    return error;
  }

  module.exports = Pipeline;
})();

},{"spromise":6}],20:[function(require,module,exports){
(function() {
  "use strict";

  var StatefulItems = require('./stateful-items');
  var storage = {};

  var registryId = 0;
  function getRegistryId() {
    return 'generic-' + registryId++;
  }


  /**
   * Module registry
   */
  function Registry(options) {
    options = options || {};
    this._id     = options.id || getRegistryId();
    this.modules = options.modules || new StatefulItems();
  }


  Registry.prototype.clear = function() {
    if (storage.hasOwnProperty(this._id)) {
      delete storage[this._id];
    }
    return this;
  };


  Registry.prototype.hasModule = function(name) {
    return this.modules.hasItem(name);
  };


  Registry.prototype.getModule = function(name) {
    return this.modules.getItem(name);
  };


  Registry.prototype.deleteModule = function(name) {
    return this.modules.removeItem(name);
  };


  Registry.prototype.setModule = function(state, name, item) {
    return this.modules.setItem(state, name, item);
  };


  Registry.prototype.getModuleState = function(name) {
    return this.modules.getState(name);
  };


  Registry.prototype.hasModuleWithState = function(state, name) {
    return this.modules.hasItemWithState(state, name);
  };


  Registry.prototype.getModuleWithState = function(state, name) {
    return this.modules.getItemWithState(state, name);
  };


  /**
   * Factory method that creates Registries with an id
   */
  Registry.getById = function(id) {
    if (!id) {
      id = getRegistryId();
    }

    return storage[id] || (storage[id] = new Registry({id: id}));
  };


  /**
   * Destroys Registries by id.
   */
  Registry.clearById = function(id) {
    if (storage.hasOwnProperty(id)) {
      return storage[id].clear();
    }
  };


  module.exports = Registry;
})();

},{"./stateful-items":21}],21:[function(require,module,exports){
(function() {
  "use strict";

  function StatefulItems(items) {
    this.items = items || {};
  }


  /**
   * Helper methods for CRUD operations on `items` map for based on their StateTypes
   */


  StatefulItems.prototype.getState = function(name) {
    if (!this.hasItem(name)) {
      throw new TypeError("`" + name + "` not found");
    }

    return this.items[name].state;
  };


  StatefulItems.prototype.hasItemWithState = function(state, name) {
    return this.hasItem(name) && this.items[name].state === state;
  };


  StatefulItems.prototype.getItemWithState = function(state, name) {
    if (!this.hasItemWithState(state, name)) {
      throw new TypeError("`" + name + "` is not " + state);
    }

    return this.items[name].item;
  };


  StatefulItems.prototype.hasItem = function(name) {
    return this.items.hasOwnProperty(name);
  };


  StatefulItems.prototype.getItem = function(name) {
    if (!this.hasItem(name)) {
      throw new TypeError("`" + name + "` not found");
    }

    return this.items[name].item;
  };


  StatefulItems.prototype.removeItem = function(name) {
    if (!this.items.hasOwnProperty(name)) {
      throw new TypeError("`" + name + "` cannot be removed - not found");
    }

    var item = this.items[name];
    delete this.items[name];
    return item.item;
  };


  StatefulItems.prototype.setItem = function(state, name, item) {
    return (this.items[name] = {item: item, state: state}).item;
  };


  module.exports = StatefulItems;
})();

},{}],22:[function(require,module,exports){
(function() {
  "use strict";

  function noop() {
  }

  function isNull(item) {
    return item === null || item === (void 0);
  }

  function isArray(item) {
    return item instanceof(Array);
  }

  function isString(item) {
    return typeof(item) === "string";
  }

  function isObject(item) {
    return typeof(item) === "object";
  }

  function isPlainObject(item) {
    return !!item && !isArray(item) && (item.toString() === "[object Object]");
  }

  function isFunction(item) {
    return !isNull(item) && item.constructor === Function;
  }

  function isDate(item) {
    return item instanceof(Date);
  }

  function result(input, args, context) {
    if (isFunction(input) === "function") {
      return input.apply(context, args||[]);
    }
    return input[args];
  }

  function toArray(items) {
    if (isArray(items)) {
      return items;
    }

    return Object.keys(items).map(function(item) {
      return items[item];
    });
  }

  /**
   * Copies all properties from sources into target
   */
  function extend(target) {
    var source, length, i;
    var sources = Array.prototype.slice.call(arguments, 1);
    target = target || {};

    // Allow n params to be passed in to extend this object
    for (i = 0, length  = sources.length; i < length; i++) {
      source = sources[i];
      for (var property in source) {
        if (source.hasOwnProperty(property)) {
          target[property] = source[property];
        }
      }
    }

    return target;
  }

  /**
   * Deep copy of all properties insrouces into target
   */
  function merge(target) {
    var source, length, i;
    var sources = Array.prototype.slice.call(arguments, 1);
    target = target || {};

    // Allow `n` params to be passed in to extend this object
    for (i = 0, length  = sources.length; i < length; i++) {
      source = sources[i];
      for (var property in source) {
        if (source.hasOwnProperty(property)) {
          if (isPlainObject(source[property])) {
            target[property] = merge(target[property], source[property]);
          }
          else {
            target[property] = source[property];
          }
        }
      }
    }

    return target;
  }


  function printError(error) {
    if (error && !error.handled) {
      error.handled = true;
      if (error.stack) {
        console.log(error.stack);
      }
      else {
        console.error(error);
      }
    }

    return error;
  }


  function forwardError(error) {
    return error;
  }


  function notImplemented() {
    throw new TypeError("Not implemented");
  }


  module.exports = {
    isNull: isNull,
    isArray: isArray,
    isString: isString,
    isObject: isObject,
    isPlainObject: isPlainObject,
    isFunction: isFunction,
    isDate: isDate,
    toArray: toArray,
    noop: noop,
    result: result,
    extend: extend,
    merge: merge,
    printError: printError,
    forwardError: forwardError,
    notImplemented: notImplemented
  };
})();

},{}],23:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],24:[function(require,module,exports){
(function (global){
/*! http://mths.be/punycode v1.2.4 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports;
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^ -~]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /\x2E|\u3002|\uFF0E|\uFF61/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		while (length--) {
			array[length] = fn(array[length]);
		}
		return array;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings.
	 * @private
	 * @param {String} domain The domain name.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		return map(string.split(regexSeparators), fn).join('.');
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <http://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * http://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols to a Punycode string of ASCII-only
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name to Unicode. Only the
	 * Punycoded parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it on a string that has already been converted to
	 * Unicode.
	 * @memberOf punycode
	 * @param {String} domain The Punycode domain name to convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(domain) {
		return mapDomain(domain, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name to Punycode. Only the
	 * non-ASCII parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it with a domain that's already in ASCII.
	 * @memberOf punycode
	 * @param {String} domain The domain name to convert, as a Unicode string.
	 * @returns {String} The Punycode representation of the given domain name.
	 */
	function toASCII(domain) {
		return mapDomain(domain, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.2.4',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <http://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],25:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],26:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],27:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":25,"./encode":26}],28:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var punycode = require('punycode');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a puny coded representation of "domain".
      // It only converts the part of the domain name that
      // has non ASCII characters. I.e. it dosent matter if
      // you call it with a domain that already is in ASCII.
      var domainArray = this.hostname.split('.');
      var newOut = [];
      for (var i = 0; i < domainArray.length; ++i) {
        var s = domainArray[i];
        newOut.push(s.match(/[^A-Za-z0-9_-]/) ?
            'xn--' + punycode.encode(s) : s);
      }
      this.hostname = newOut.join('.');
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  Object.keys(this).forEach(function(k) {
    result[k] = this[k];
  }, this);

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    Object.keys(relative).forEach(function(k) {
      if (k !== 'protocol')
        result[k] = relative[k];
    });

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      Object.keys(relative).forEach(function(k) {
        result[k] = relative[k];
      });
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especialy happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!isNull(result.pathname) || !isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host) && (last === '.' || last === '..') ||
      last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last == '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especialy happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!isNull(result.pathname) || !isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

function isString(arg) {
  return typeof arg === "string";
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isNull(arg) {
  return arg === null;
}
function isNullOrUndefined(arg) {
  return  arg == null;
}

},{"punycode":24,"querystring":27}],29:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"_process":23,"dup":6}],30:[function(require,module,exports){
/**
 * Copyright (c) 2014 Miguel Castillo.
 * Licensed under MIT
 */

(function() {
  "use strict";

  var Promise = require('spromise');

  var readyStates = {
    UNSENT           : 0, // open()has not been called yet.
    OPENED           : 1, // send()has not been called yet.
    HEADERS_RECEIVED : 2, // send() has been called, and headers and status are available.
    LOADING          : 3, // Downloading; responseText holds partial data.
    DONE             : 4  // The operation is complete.
  };

  function Ajax(options) {
    if (typeof(options) === "string") {
      options = {url: options};
    }

    var deferred = Promise.defer();
    var request  = new XMLHttpRequest(),
        url      = options.url,
        method   = options.method  || "GET",
        data     = options.data    || null,
        headers  = options.headers || {},
        async    = Boolean(options.async);

    if (!url) {
      throw new TypeError("Must provide a URL");
    }

    for (var header in headers) {
      if (headers.hasOwnProperty(header)) {
        request.setRequestHeader(header, headers[header]);
      }
    }

    if (async) {
      request.onreadystatechange = StateChanged.bind(request, options, deferred);
    }

    // Send request
    request.open(method, url, async, options.user, options.password);
    request.send(data);

    if (!async) {
      StateChanged.call(request, options, deferred);
    }

    return deferred.promise;
  }

  function StateChanged(options, deferred) {
    var request = this,
        state   = request.readyState;

    if (state === readyStates.DONE) {
      if (request.status === 200) {
        var result = (options.transform || transform)(request.responseText, options.responseType);
        deferred.resolve(result, request);
      }
      else {
        deferred.reject(request);
      }
    }
  }

  function transform(text, type) {
    if (type === 'json') {
      return JSON.parse(text);
    }

    return text;
  }

  module.exports = Ajax;
})();

},{"spromise":29}],31:[function(require,module,exports){
/**
 * Module to extract dependencies from define and require statments
 */
(function() {
  'use strict';


  var TokenTypes = {
    _define         : 'define',
    _require        : 'require',
    Identifier      : 'Identifier',
    Literal         : 'Literal',
    ArrayExpression : 'ArrayExpression'
  };


  var acorn = require('acorn'),
      walk  = require('acorn/util/walk');

  /**
   * Method to pull dependencies from a JavaScript source string.
   *
   * @param {string} source - Source to parse
   * @param {object} options - Options passed to acorn
   *
   * @returns {object:{array: dependencies}} - Object with dependencies
   */
  function PullDeps(source, options) {
    return PullDeps.walk(acorn.parse(source, options));
  }


  /**
   * Method to pull dependencies from an AST.
   *
   * @param {object} ast - AST to traverse in order to find all dependencies.
   *
   * @returns {object:{array: dependencies}} - Object with dependencies
   */
  PullDeps.walk = function(ast) {
    var result = {dependencies: []};

    function callExpression(node) {
      if (isName(node.callee, TokenTypes._require)) {
        var dependency = getDependencyString(node.arguments);
        if (dependency) {
          result.dependencies.push(dependency);
        }
      }
      else if (isName(node.callee, TokenTypes._define)) {
        var dependencies = getDependencyArray(node.arguments);
        if (dependencies && dependencies.length) {
          result.dependencies = result.dependencies.concat(dependencies);
        }
      }
    }

    walk.simple(ast, {
      'CallExpression': callExpression
    });

    return result;
  };


  function isName(node, name) {
    return TokenTypes.Identifier === node.type && name === node.name;
  }


  function getDependencyString(nodes) {
    if (nodes.length === 1 && TokenTypes.Literal === nodes[0].type) {
      return nodes[0].value;
    }
  }


  function getDependencyArray(nodes) {
    var elements, i, length;

    // Handle define([], function() {}) format
    if (isArrayExpession(nodes[0])) {
      elements = nodes[0].elements;
    }
    // Handle define("modulename", [], function() {}) format
    else if (isArrayExpession(nodes[1])) {
      elements = nodes[1].elements;
    }

    if (elements) {
      for (i = 0, length = elements.length; i < length; i++) {
        elements[i] = elements[i].value;
      }
    }

    return elements;
  }


  function isArrayExpession(node) {
    return node && TokenTypes.ArrayExpression === node.type;
  }


  module.exports = PullDeps;
})();

},{"acorn":1,"acorn/util/walk":2}],32:[function(require,module,exports){
var Fetcher      = require("./fetchxhr"),
    Define       = require('./define'),
    Require      = require('./require'),
    dependencies = require('./transforms/dependencies'),
    acorn        = require('acorn'),
    acornWalker  = require('acorn/util/walk'),
    Bitloader    = require('bit-loader');


var defaultTransform = [{
    name: "deps",
    handler: dependencies
  }];


/**
 * Default options for bit imports instances
 * @private
 * @memberof Bitimports
 * @property {string} baseUrl - Url modules are relative to
 * @property {Object} paths - Map of module names to module locations
 * @property {Object} shim - Definition of modules that are loaded into the global space that need to be used a modules
 * @property {Array.<string>} deps - List of dependencies to be loaded before the first module is loaded.
 * @property {Array.<Object>} packages - List of package definition to map module names to directory structures
 * @property {Array.<string|Function|Object>} transforms - List of transformations that process module source files.
 */
var defaults = {
  baseUrl    : ".",
  paths      : {},
  shim       : {},
  deps       : [],
  packages   : [],
  transforms : []
};


/**
 * Bitimports is a facade that exposes an interface for module management.
 *
 * @class
 * @private
 *
 * @param {Object} options - Configuration settings to create bit imports
 *  instance.
 *  Please take a look over at [amd resolver]{@link https://github.com/MiguelCastillo/amd-resolver}
 *  for details on the options.
 * @param {string} options.baseUrl - Is the root URL that all modules are
 *  relative to.
 * @param {Object} options.paths - Is a map of module names to module locations
 *  This really useful for setting up module names that are more legible and
 *  easier to maintain.
 * @param {Array.<(string|Function|Object)>} options.transforms[] - Collection of
 *  transforms to be applied to module meta sources.
 * @param {string} options.transforms[] - Transform to be loaded as a named
 *  module.
 * @param {Function} options.transforms[] - Anonymous transformation that
 *  transforms module meta source.
 * @param {Object} options.transforms[] - More specific transform configuration
 *  where either a name or handler function must be provided.
 * @param {string} options.transforms[].name - If item.handler isn't present,
 *  then bit imports will load the transform as a module. Otherwise, it is
 *  pretty much only used for logging purposes.
 * @param {Function} options.transforms[].handler - If item.name isn't present,
 *  then the handler is considered an anonymous transform, otherwise it is
 *  considered a named transformed. Named transforms are very useful when
 *  debugging because transforms' names are logged
 */
function Bitimports(options) {
  options = options || {};
  options.transforms = (options.transforms || []).concat(defaultTransform);

  this.settings = Bitimports.Utils.merge({}, defaults, options);
  this.loader   = new Bitloader(this.settings, {fetch: fetchFactory(this)});

  this.import   = this.loader.import;
  this.register = this.loader.register;

  this._require = new Require(this);
  this.require  = this._require.require.bind(this._require);

  this._define  = new Define(this);
  this.define   = this._define.define.bind(this._define);

  // Add `amd` for compliance
  this.define.amd = {};
}


/** Promise constructor */
Bitimports.Promise = Bitimports.prototype.Promise = Bitloader.Promise;

/** Module constructor */
Bitimports.Module = Bitimports.prototype.Module = Bitloader.Module;

/** Logger singleton and factory */
Bitimports.Logger = Bitimports.prototype.Logger = Bitloader.Logger;

/** Helper Utilities */
Bitimports.Utils = Bitimports.prototype.Utils = Bitloader.Utils;


/**
 * Method to asynchronously load modules
 *
 * @function
 *
 * @param {string|Array.<string>} names - Module or list of modules names to
 *  load. These names map back to the paths settings Bitimports was created
 *  with.
 *
 * @returns {Promise} That when resolved, all the imported modules are passed
 *  back as arguments.
 */
Bitimports.prototype.import = function(){};


/**
 * Method to define a module to be asynchronously loaded via the
 * [import]{@link Bitimports#import} method
 *
 * @param {string} name - Name of the module to register
 * @param {Array.<string>} deps - Collection of dependencies to be loaded and
 *  passed into the factory callback method.
 * @param {Function} factory - Function to be called in order to instantiate
 *  (realize) the module
 */
Bitimports.prototype.register = function(){};


/**
 * Method to get modules.
 *
 * @param {string | Array.<string>} names - module name(s) to be loaded. When
 *  array is provided, the ready callback is always called to get the
 *  resulting modules.
 * @param {Function} ready - Callback function, which is called when the
 *  module(s) are loaded and ready for the application to consume.
 * @param {Object} options - Configuration settings specific to the
 *  [require]{@link Bitimports#require} call. For example, you can specify a
 *  `modules` map to tell bit imports to use those modules before loading
 *  them from storage or cache.
 *  This is particularly useful for unit tests where dependency injection of
 *  mocked modules is needed.
 *
 * @returns {Promise|Module} When `require` is called with a single string and
 *  the module has already been loaded, then the actual module is returned.
 *  This is to follow `CJS` module format. If more than one module is
 *  `require`d, then a Promise is returned that when resolved, all the
 *  `require`d modules are passed in.
 */
Bitimports.prototype.require = function(){};


/**
 * Method to define a Module using AMD format, which can be dynamically
 * imported.
 *
 * @param {string} [name] - is the name of the module to define. If no name
 *  is present, then the last anonymous `define` is coerced to be the named
 *  module definition. An anonymous module is one with no name.
 * @param {Array.<string>} [dependencies] - list of module names to be loaded
 *  before the module definition is processed and executed (evaluated).
 * @param {*} factory - When factory is a function, it is called when the
 *  module is executed (evaluated) to define the module code. Whatever is
 *  returned from calling factory becomes the actual module code that's
 *  returned when the module is imported.
 *  When dependencies are defined, those are passed to factory as arguments.
 *  If factory is not a function, then that is the actual module code that is
 *  returned when the module is imported.
 */
Bitimports.prototype.define = function(){};


/**
 * Method to configure an instance of bit imports.
 *
 * config applies configuration settings to the particular instance of bit
 * imports. It will also create and return a new instance of bit imports with
 * the configuration settings passed in. The config method is generally your
 * primary way of configuring bit imports.
 *
 * @param {Object} [options] - Configuration settings used for creating the
 *  instance of bit imports.
 *
 * @see [imports settings]{@link Bitimports} options for more details.
 *
 * @returns {Bitimports} Instance of bit imports
 */
Bitimports.prototype.config = function(options) {
  Bitimports.Utils.merge(this.settings, options);
  return this.factory(options);
};


/**
 * Method that creates bit import instances. Options is the same as
 * [config]{@link Bitimports#config}, so please refer to that for details.
 *
 * @param {Object} options - Configuration settings used for creating the
 *  instance of bit imports.
 *
 * @see [imports settings]{@link Bitimports} options for more details.
 *
 * @returns {Bitimports} Instance of bit imports
 */
Bitimports.prototype.factory = function(options) {
  return new Bitimports(options);
};


/**
 * Convenience method to run the input string through the transformation
 * workflow
 *
 * @param {string} source - Source string to be processed by the transformation
 *  workflow.
 *
 * @returns {Promise} That when resolved, the processed text is returned.
 */
Bitimports.prototype.transform = function(source) {
  return this.loader.providers.loader
    .transform({source: source})
    .then(function(moduleMeta) {
      return moduleMeta.source;
    }, Bitimports.Utils.forwardError);
};


/**
 * Convenience method to create an AST (Abstract Syntax Tree) from the input
 * source string. The ast is built with [acorn]{@link http://marijnhaverbeke.nl/acorn/},
 * so please feel free to check it out for details on how it works and its
 * options.
 *
 * @param {string} source - Source string to create the AST from.
 * @param {Object} options - Configuration settings passed directly into acorn.
 *  Please refer to [acorn]{@link http://marijnhaverbeke.nl/acorn/} for all
 *  valid options.
 *
 * @returns {{ast: Object, walk: Function}} Object with built ast and a helper
 *  function called walk, which is provider by acorn to help in the tree
 *  traversal process.
 */
Bitimports.prototype.AST = function(source, options) {
  return {
    ast: acorn.parse(source, options),
    walk: acornWalker
  };
};


/**
 * fetchFactory is the hook for Bitloader to get a hold of a fetch provider
 *
 * @ignore
 * @private
 *
 * @param {Bitimports} importer - Instance of Bitimports
 *
 * @returns {Function} Factory function that creates instances of Fetcher; the
 *  fetch provider
 */
function fetchFactory(importer) {
  return function fetch(loader) {
    return new Fetcher(loader, importer);
  };
}


/**
 * `bitimports` is the default Bitimports instance available. All you need to
 * do if configure it with the [config]{@link Bitimports#config} method to
 * define how your application is structured. The goal of the configuration
 * step is to help you make your code simple and readable when importing and
 * exporting modules.
 *
 * When the bit-imports module is loaded via script tag, which is the more
 * common use case in the browser, `bitimports` is automatically added to the
 * global object.  But since bit-imports is a [UMD]{@link https://github.com/umdjs/umd}
 * module, feel free to load it as an [AMD]{@link https://github.com/amdjs/amdjs-api/wiki/AMD}
 * or [CJS]{@link http://wiki.commonjs.org/wiki/Modules/1.1.1} module.
 *
 * `bitimports` exposes methods such as [require]{@link Bitimports#require},
 * [define]{@link Bitimports#define}, [import]{@link Bitimports#import}, and
 * [register]{@link Bitimports#register} to provide a comprehensive system for
 * loading modules synchronously and asynchronously in `AMD` and `CJS` module
 * formats.
 *
 * @global
 * @name bitimports
 * @type Bitimports
 * @see {@link Bitimports}
 */
module.exports = new Bitimports();

},{"./define":34,"./fetchxhr":35,"./require":36,"./transforms/dependencies":37,"acorn":1,"acorn/util/walk":2,"bit-loader":7}],33:[function(require,module,exports){
/**
 * @class
 *
 * Factory to create `compile` method to be used by module meta objects to
 * compile themselves into module instances.
 *
 * @param {Fetcher} fetcher - Instance of fetcher that gives us access to the
 *  importer/loader environment.
 * @param {Object} moduleMeta - Module meta object to be compiled whe the
 *  compile method is called.
 * @param {Object} parentMeta - Parent module meta object to establish a
 *  hierarchy of modules requesting other modules.
 *
 * @returns {Function} Method that compiles the module meta object passed in.
 */
function Compile(fetcher, moduleMeta, parentMeta) {
  var importer = fetcher.importer;

  /**
   * Method that evaluates the module meta source
   *
   * @private
   */
  function evaluate() {
    var url      = moduleMeta.url.href;
    var source   = moduleMeta.source + getSourceUrl(url);
    var pathInfo = getPathInfo(url, fetcher);
    var _module  = {exports: {}, id: moduleMeta.name, url: url, meta: moduleMeta, parent: parentMeta};

    /* jshint -W061, -W054 */
    var execute = new Function("__dirname", "__filename", "System", "define", "require", "module", "exports", source);
    /* jshint +W061, +W054 */

    var result = execute(pathInfo.__dirname, pathInfo.__filename, importer, importer.define, importer.require, _module, _module.exports);

    return {
      result: result,
      module: _module
    };
  }

  /**
   * Method that executes a module meta object in order to generate a final Module product.
   * It does it by first evaluating the module meta source, then collecting any `AMD` define
   * calls, then figuring out what type of Module is created.
   *
   * @returns {Module}
   */
  function compile() {
    var logger = importer.Logger.factory("Bitimporter/Compile");
    logger.log(moduleMeta.name, moduleMeta);

    // Evaluation will execute the module meta source, which might call `define`.
    // When that happens, `getDefinitions` will get us the proper module definitions.
    var evaluated   = evaluate();
    var definitions = importer._define.getDefinitions(moduleMeta.name);

    if (definitions) {
      definitions.type = importer.Module.Type.AMD;
      return new importer.Module(definitions);
    }

    // If `define` was not called, the we will try to assign the result of the function
    // call to support IIFE, or exports.
    moduleMeta.type = evaluated.result ? importer.Module.Type.IIFE : importer.Module.Type.CJS;
    moduleMeta.code = evaluated.result || evaluated.module.exports;
    return new importer.Module(moduleMeta);
  }

  return compile;
}

/*
 * Builds a `# sourceURL` string from the URL.
 *
 * @private
 */
function getSourceUrl(url) {
  return "\n//# sourceURL=" + url;
}


/**
 * Function that extracts the __dirname and __filename
 *
 * @private
 * @returns {{__dirname: string, __filename: string}}
 */
function getPathInfo(url, fetcher) {
  var pathInfo = fetcher.resolver.File.parseParts(url);
  return {
    __dirname: pathInfo.directory,
    __filename: pathInfo.path
  };
}


module.exports = Compile;

},{}],34:[function(require,module,exports){
/**
 * @class
 *
 * Interface for AMD modules `define`. It handles anonymous and named module definitions
 * with a variatery of `define` signatures.
 */
function Define(importer) {
  this.importer = importer;
}


/**
 * Defines a module to be loaded and consumed by other modules.  Two types of
 * modules come through here, named and anonymous.
 */
Define.prototype.define = function () {
  var mod     = Define.adapters.apply(this, arguments),
      context = this._getContext();

  if (mod.name) {
    // Do no allow modules to override other modules...
    if (context.modules.hasOwnProperty(mod.name)) {
      throw new Error("Module " + mod.name + " is already defined");
    }
    else {
      context.modules[mod.name] = mod;
    }
  }
  else {
    context.anonymous.push(mod);
  }
};


/**
 * Processes the current context making sure that any anonymous module definitions
 * are properly converted to named defintions when applicable.
 */
Define.prototype.getDefinitions = function(name) {
  var context = this._clearContext();

  // define was never called...
  if (!context) {
    return;
  }

  var anonymous = context.anonymous,
      modules   = context.modules,
      mod       = modules[name];

  if (!mod && anonymous.length) {
    mod      = anonymous.shift();
    mod.name = name;
    modules[mod.name] = mod;
  }

  if (mod) {
    mod.modules = modules;
  }

  return mod;
};


/**
 * Gets the current context.  If it does not exist, one is created.
 *
 * @private
 */
Define.prototype._getContext = function() {
  return this.context || (this.context = {
    modules: {},
    anonymous: []
  });
};


/**
 * Deletes and returns the current context.
 *
 * @private
 */
Define.prototype._clearContext = function() {
  var context = this.context;
  delete this.context;
  return context;
};


/**
 * Adapter interfaces to define modules
 *
 * @private
 */
Define.adapters = function (name, deps, factory) {
  var signature = ["", typeof name, typeof deps, typeof factory].join("/");
  var adapter   = Define.adapters[signature];

  if (!adapter) {
    throw new TypeError("Module define signature isn't valid: " + signature);
  }

  return adapter.apply(this, arguments);
};


/*
 * Creates an object with relevant information from a `define` call
 */
Define.adapters.create = function (name, deps, factory) {
  var moduleMeta = {
    name: name,
    deps: deps
  };

  if (typeof(factory) === "function") {
    moduleMeta.factory = factory;
  }
  else {
    moduleMeta.code = factory;
  }

  return moduleMeta;
};


/*
 * This is a table for quickly detecting the signature that `define` was called
 * with.  This is just a much more direct execution path than building blocks
 * of if statements.
 */
Define.adapters["/string/object/function"]        = function (name, deps, factory) { return Define.adapters.create.call(this, name, deps, factory); };
Define.adapters["/string/function/undefined"]     = function (name, factory)       { return Define.adapters.create.call(this, name, [], factory); };
Define.adapters["/object/function/undefined"]     = function (deps, factory)       { return Define.adapters.create.call(this, undefined, deps, factory); };
Define.adapters["/object/undefined/undefined"]    = function (data)                { return Define.adapters.create.call(this, undefined, [], data); };
Define.adapters["/string/object/undefined"]       = Define.adapters["/string/function/undefined"];
Define.adapters["/function/undefined/undefined"]  = Define.adapters["/object/undefined/undefined"];
Define.adapters["/string/undefined/undefined"]    = Define.adapters["/object/undefined/undefined"];
Define.adapters["/number/undefined/undefined"]    = Define.adapters["/object/undefined/undefined"];
Define.adapters["/undefined/undefined/undefined"] = Define.adapters["/object/undefined/undefined"];

module.exports = Define;

},{}],35:[function(require,module,exports){
var Ajax           = require('promjax'),
    Resolver       = require('amd-resolver'),
    compileFactory = require('./compile');

/**
 * @class
 *
 * XHR fetch provider to load source files from storage
 */
function Fetcher(loader, importer) {
  var settings     = importer.Utils.merge({}, importer.settings);
  settings.baseUrl = getBaseUrl(settings.baseUrl);

  this.importer = importer;
  this.loader   = loader;
  this.resolver = new Resolver(settings);
}


/**
 * Reads file via XHR from storage
 */
Fetcher.prototype.fetch = function(name, parentMeta) {
  var fetcher    = this,
      moduleMeta = this.resolver.resolve(name, getWorkingDirectory(parentMeta)),
      url        = moduleMeta.url.href;

  var logger = this.importer.Logger.factory("Bitimporter/Fetch");
  logger.log(moduleMeta.name, moduleMeta, url);

  moduleMeta.loader   = this.loader;
  moduleMeta.importer = this.importer;

  return (new Ajax(url)).then(function(source) {
    moduleMeta.source  = source;
    moduleMeta.compile = compileFactory(fetcher, moduleMeta, parentMeta);
    return moduleMeta;
  });
};


/*
 * This will adjust the baseUrl in the settings so that requests get the absolute
 * url so that browsers can better handle `# sourceURL`.  In chrome for example,
 * the files are added to the developer tools' source tree, which let's you put
 * break points directly from the developer tools.
 */
function getBaseUrl(url) {
  return Resolver.URL.parser.resolve(window.location.href, url || "");
}

/*
 * Gets the url form the module data if it exists.
 */
function getWorkingDirectory(moduleMeta) {
  return moduleMeta && moduleMeta.url ? moduleMeta.url.href : "";
}


module.exports = Fetcher;

},{"./compile":33,"amd-resolver":4,"promjax":30}],36:[function(require,module,exports){
/**
 * @class
 *
 * Interface for `require` functionality
 */
function Require(importer) {
  this.importer = importer;
  this.loader   = importer.loader;
  this.context  = importer.loader.context;
}


/**
 * Method that imports a module.
 *
 * @param {string|string[]} name - Name or collection of module names to be loaded
 * @param {Function} [ready] - Function called when module(s) are loaded
 * @param {Object} [options] - Options used by the import interface.
 *
 * @returns {Promise|Module}
 */
Require.prototype.require = function(name, ready, options) {
  var loader = this.loader,
      logger = loader.Logger.factory("Bitimporter/require");

  logger.log(name, loader.context._id);

  if (loader.hasModule(name)) {
    return loader.getModuleCode(name);
  }
  else {
    return loader.import(name, options).done(ready || loader.Utils.noop);
  }
};

module.exports = Require;

},{}],37:[function(require,module,exports){
var pullDeps = require('pulling-deps/src/index');

function dependencies(moduleMeta) {
  if (!ignoreModule(moduleMeta, this.ignore)) {
    loadDependencies(moduleMeta, pullDeps(moduleMeta.source, this.options).dependencies);
  }
}

function loadDependencies(moduleMeta, deps) {
  if (deps.length) {
    moduleMeta.deps = moduleMeta.deps.concat(deps);
  }
}

function ignoreModule(moduleMeta, ignoreList) {
  return ignoreList && ignoreList.length && ignoreList.indexOf(moduleMeta.name) !== -1;
}

module.exports = dependencies;

},{"pulling-deps/src/index":31}]},{},[32])(32)
});