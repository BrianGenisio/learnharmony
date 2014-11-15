export var page = {
    "title": "For/of loops",
    "next": "es6discuss/iterators-two-way",
    "nextText": "Iterators (Two Way)",
    "heading": "For/of loops",
    "code": "function* getValues() {\n  yield 1;\n  yield 2;\n  yield 3;\n}\n\nfor(let value of getValues()) {\n  console.log(value);\n}",
    "intro": ""
};