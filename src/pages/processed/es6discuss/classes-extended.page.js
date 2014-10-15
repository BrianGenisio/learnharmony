export var page = {
    "title": "Extending Classes",
    "next": "es6discuss/block-scoping",
    "nextText": "Block Scoping",
    "heading": "Extending Classes",
    "code": "class Person {\n  constructor(first, last) {\n    this.first = first;\n    this.last = last;\n  }\n}\n\nclass Employee extends Person {\n    constructor(first, last) {\n        super(first, last);\n        this.type = 'employee';\n    }\n}\n\nvar brian = new Employee('Brian', 'Genisio');\n\nconsole.log(brian);",
    "intro": ""
};