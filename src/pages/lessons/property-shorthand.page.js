export var page = {
    "title": "Property Shorthand",
    "navGroup": ".lessons",
    "next": "lessons/method-shorthand",
    "nextText": "Want more shorthand syntax?  Let's talk about Method Shorthand.",
    "heading": "Property Shorthand",
    "code": "function makeParent(first, last) {\n    return {first, last, isParent: true};\n}\n\nconsole.log(makeParent('Darth', 'Vader'));",
    "intro": "<p>This feature is really just a shorthand notation for what you are used to writing for object literals.  When the variable name is the same as the object key, you can use a shorthand notation.</p>\n<p>In other words, <code>{first: first, last: last}</code> can be written as <code>{first, last}</code>.  Shorthand notation can be mixed with traditional notation: <code>{first, last, isParent: true}</code>.</p>\n<h3 id=\"give-it-a-try\">Give it a try</h3>\n"
};