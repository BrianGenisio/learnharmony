export var page = {
    "title": "Extending Classes (Revisited)",
    "next": "es6discuss/modules",
    "nextText": "Modules",
    "heading": "Revisiting Extending Classes",
    "code": "class Person {\n  constructor(first, last) {\n    this.first = first;\n    this.last = last;\n  }\n}\n\nclass Employee extends Person {\n    constructor(...params) {\n        super(...params);\n        this.type = 'employee';\n    }\n}\n\nvar brian = new Employee('Brian', 'Genisio');\n\nconsole.log(brian);",
    "intro": ""
};