export var page = {
    "title": "Object Literals -- Dynamic Properties",
    "next": "es6discuss/default-values",
    "nextText": "Default Values",
    "heading": "Dynamic Property Names",
    "code": "function make(key, value) {\n  return {\n    [key]: value\n  }\n}\n\nvar made = make('foo', 'bar');\n\nconsole.log(made);",
    "intro": ""
};