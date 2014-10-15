export var page = {
    "title": "Object Literals",
    "next": "es6discuss/dynamic-prop-names",
    "nextText": "Dynamic Property Names",
    "heading": "Updates to Object Literals",
    "code": "let value = 55;\n\nlet obj = { \n   value,\n   toString() {\n     return `The value is ${this.value}`;\n   }\n};\n\nconsole.log(obj.toString());",
    "intro": ""
};