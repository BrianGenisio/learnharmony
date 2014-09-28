export var page = {
    "title": "Default Parameters",
    "navGroup": ".lessons",
    "next": "lessons/block-scope-let",
    "nextText": "Next, let's find out two new ways to declare variables.",
    "heading": "Default Parameters",
    "code": "function logDefaults(a = 1, b = 2, c = 3) {\n    console.log({a, b, c});\n}\n\nlogDefaults();\n\nfunction logDestructuredDefaults({a:A = 1, b:B, c:C = 3}) {\n    console.log({A, B, C});\n}\n\nlogDestructuredDefaults({b: 2});\n\nlet {a=1, b=2, c=3} = {};\nconsole.log({a, b, c});",
    "intro": "<p>You have probably wanted it for a long time.  FINALLY!  You can define default values for parameters. Defaults can be assigned to any parameter. You can even assign default values to destructured values (both as function parameters and non-function destructuring).</p>\n<h3 id=\"give-it-a-try\">Give it a try</h3>\n"
};