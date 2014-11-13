export var page = {
    "title": "Private Properties in Classes",
    "next": "es6discuss/proxies",
    "nextText": "Proxies",
    "heading": "Private Properties in Classes",
    "code": "let priv = new WeakMap();\n\nclass Person {\n  constructor(first, last) {\n    priv.set(this, {first, last});\n  }\n\n  get first() { return priv.get(this).first; }\n  get last() { return priv.get(this).last; }\n}\n\n// Later, in another module\nvar brian = new Person('Brian', 'Genisio');\n\nconsole.log(brian.first, brian.last);",
    "intro": ""
};