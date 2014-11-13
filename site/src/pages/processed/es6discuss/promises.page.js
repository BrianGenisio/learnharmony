export var page = {
    "title": "Promises",
    "next": "es6discuss/generators",
    "nextText": "Generators",
    "heading": "Promises",
    "code": "var promise = new Promise((resolve, reject) => {\n    setTimeout(() => resolve(55), 1000);\n});\n\npromise.then(console.log);\n\nvar promise2 = new Promise((resolve, reject) => {\n    setTimeout(() => resolve(99), 2000);\n});\n\nPromise.all([promise, promise2])\n    .then(([v1, v2]) => console.log(v1, v2));",
    "intro": ""
};