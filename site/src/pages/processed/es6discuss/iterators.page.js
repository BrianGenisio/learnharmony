export var page = {
    "title": "Iterators",
    "next": "es6discuss/iterators-two-way",
    "nextText": "Iterators (Two Way)",
    "heading": "Iterators",
    "code": "function iterateElements(array) {\n  return {\n    [Symbol.iterator]: function() {\n      var index = 0;\n      var current;\n      return {\n        next: function() {\n          if (index < array.length) {\n            current = array[index++];\n            return {\n              value: current,\n              done: false\n            };\n          }\n          return {\n            value: undefined,\n            done: true\n          }\n        }\n      };\n    }\n  };\n}\n\nvar generator = iterateElements([1,2,3]);\n\nfor (var value of generator) {\n  console.log(value);\n}",
    "intro": ""
};