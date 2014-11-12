export var page = {
    "title": "Array Methods",
    "next": "es6discuss/classes",
    "nextText": "Classes",
    "heading": "Array Methods",
    "code": "var data = [1, 2, 3, 4];\nvar firstEven = data.find(x => x % 2 === 0);\nvar firstEvenIndex = data.findIndex(x => x % 2 === 0);\n\nconsole.log(firstEven);\nconsole.log(firstEvenIndex);\n\ndata.fill(0);\n\nconsole.log(data);",
    "intro": ""
};