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
