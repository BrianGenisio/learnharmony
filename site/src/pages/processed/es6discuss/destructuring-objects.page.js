export var page = {
    "title": "Destructuring Objects/Arrays",
    "next": "es6discuss/rest",
    "nextText": "Rest/Spread parameters",
    "heading": "Destructuring Objects/Arrays",
    "code": "let person = {\n  first: 'Brian',\n  last: 'Genisio'\n};\nlet point = [3, 4]\n\nvar {first, last} = person;\nlet [x, y] = point;\n\nconsole.log(first, last);\nconsole.log(x, y);\n\n// Nice shorthand for swapping\n[y, x] = [x, y];\n\nconsole.log(x, y);",
    "intro": ""
};