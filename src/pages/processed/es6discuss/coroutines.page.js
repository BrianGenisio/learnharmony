export var page = {
    "title": "Coroutines",
    "heading": "Coroutines",
    "code": "co(function *(){\n  let index = yield $.get('index.html');\n  let bower = yield $.get('bower.json');\n\n  console.log(index.length);\n  console.log(bower);\n})();",
    "intro": ""
};