export var page = {
    "title": "Proxies",
    "heading": "Proxies",
    "code": "let logger = {\n  get: function(target, name, receiver) {\n    console.log(`getting ${ name }`);\n    return target[name].toUpperCase();\n  }\n};\n\nlet person = { first: 'Brian', last: 'Genisio' };\nlet proxied = Proxy(person, logger);\n\nconsole.log(proxied.first);\n\nlet magic = Proxy({}, {\n  get: (target, name, receiver) => () => console.log(\"hello \" + name)\n});\n\nmagic.brian();",
    "intro": ""
};