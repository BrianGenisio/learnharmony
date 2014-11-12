export var page = {
    "title": "Coroutines",
    "next": "es6discuss/maps-sets",
    "nextText": "Maps and Sets",
    "heading": "Coroutines",
    "code": "co(function *(){\n  let index = yield $.get('index.html');\n  let bower = yield $.get('bower.json');\n\n  console.log(index.length);\n  console.log(bower);\n})();",
    "intro": "<script src=\"bower_components/co/co.js\"></script>\n<script src=\"bower_components/setimmediate/setImmediate.js\"></script> "
};