export var page = {
    "title": "Maps and Sets",
    "next": "es6discuss/classes-private",
    "nextText": "Private Class Members",
    "heading": "Maps and Sets",
    "code": "let key1 = new Date();\nlet key2 = {foo: 'bar'};\n\nlet map = new Map();\nmap.set(key1, 'first');\nmap.set(key2, 'second');\n\nconsole.log(map.get(key1), map.get(key2));\n\nlet set = new Set([1, 2, 2, 3]);\n\nconsole.log(Array.from(set));",
    "intro": ""
};