export var page = {
    "title": "Generators",
    "next": "es6discuss/for-of",
    "nextText": "For/Of Loops",
    "heading": "Generators",
    "code": "function* getValues() {\n  yield 1;\n  yield 2;\n  yield 3;\n}\n\nlet generator = getValues();\nconsole.log(generator.next());\nconsole.log(generator.next());\nconsole.log(generator.next());\nconsole.log(generator.next());",
    "intro": ""
};