export var page = {
    "title": "Rest Parameters",
    "next": "es6discuss/modules",
    "nextText": "Modules",
    "heading": "Rest Parameters",
    "code": "function format(fmt, ...values) {\n  console.log(fmt, values);\n}\n\nformat('%d: foobar, %s', 55, 'blah');\n\n\nfunction add(one, two, three) {\n  console.log(one + two + three);\n}\n\nlet values = [1, 2, 3];\nadd(...values);",
    "intro": ""
};