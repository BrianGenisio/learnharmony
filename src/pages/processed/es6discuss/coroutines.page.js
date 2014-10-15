export var page = {
    "title": "Coroutines",
    "heading": "Coroutines",
    "code": "co(function *(){\n  let a = yield get('http://google.com');\n  let b = yield get('http://yahoo.com');\n  let c = yield get('http://cloudup.com');\n\n  console.log(a[0].statusCode);\n  console.log(b[0].statusCode);\n  console.log(c[0].statusCode);\n})();",
    "intro": ""
};