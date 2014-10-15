export var page = {
    "title": "Block Scoping",
    "next": "es6discuss/const",
    "nextText": "Const values",
    "heading": "Block Scoping",
    "code": "function testBlockScoping() {\n  if(true) {\n    var functionScoped = 'function';\n    let blockScoped = 'block';\n  }\n\n  try {\n    console.log(functionScoped, blockScoped);\n  } catch(e) {\n    console.log('FAILED!!');\n  }\n}\n\ntestBlockScoping();",
    "intro": ""
};