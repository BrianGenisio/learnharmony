export var page = {
    "title": "Object Literals",
    "next": "es6discuss/default-values",
    "nextText": "Default Values",
    "heading": "Object Literals",
    "code": "let key = \"someKey\";\nlet value = 55;\n\nlet obj = { \n  value,\n  [key + ' times 2']: value,\n  toString() {\n    return `The value is ${this.value}`;\n  }\n};\n\nconsole.log(obj);\nconsole.log(obj.toString());",
    "intro": ""
};