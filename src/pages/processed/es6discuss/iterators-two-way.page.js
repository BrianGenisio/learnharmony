export var page = {
    "title": "Two-way Iterators",
    "next": "es6discuss/coroutines",
    "nextText": "Coroutines",
    "heading": "Two-way Iterators",
    "code": "function* getValues() {\n  let first = yield 1;\n  let second = yield 2 * first;\n  yield 3 * second;\n}\n\nlet generator = getValues();\nconsole.log(generator.next());\nconsole.log(generator.next(100));\nconsole.log(generator.next(200));\nconsole.log(generator.next());",
    "intro": ""
};