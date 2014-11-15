export var routes = [
    {
        "page": "about",
        "title": "About"
    },
    {
        "page": "es6discuss/arrow-functions",
        "title": "Arrow Functions",
        "next": "es6discuss/string-interpolation",
        "nextText": "String Interpolation"
    },
    {
        "page": "es6discuss/block-scoping",
        "title": "Block Scoping",
        "next": "es6discuss/const",
        "nextText": "Const values"
    },
    {
        "page": "es6discuss/classes-extended",
        "title": "Extending Classes",
        "next": "es6discuss/block-scoping",
        "nextText": "Block Scoping"
    },
    {
        "page": "es6discuss/classes-private",
        "title": "Private Properties in Classes",
        "next": "es6discuss/proxies",
        "nextText": "Proxies"
    },
    {
        "page": "es6discuss/classes",
        "title": "Classes",
        "next": "es6discuss/classes-extended",
        "nextText": "Extending Classes"
    },
    {
        "page": "es6discuss/const",
        "title": "Block Scoping",
        "next": "es6discuss/object-literals",
        "nextText": "Object Literals"
    },
    {
        "page": "es6discuss/coroutines",
        "title": "Coroutines",
        "next": "es6discuss/maps-sets",
        "nextText": "Maps and Sets"
    },
    {
        "page": "es6discuss/default-values",
        "title": "Default Parameters",
        "next": "es6discuss/destructuring-objects",
        "nextText": "Destructuring"
    },
    {
        "page": "es6discuss/destructuring-objects",
        "title": "Destructuring Objects/Arrays",
        "next": "es6discuss/rest",
        "nextText": "Rest/Spread parameters"
    },
    {
        "page": "es6discuss/for-of",
        "title": "For/of loops",
        "next": "es6discuss/iterators-two-way",
        "nextText": "Iterators (Two Way)"
    },
    {
        "page": "es6discuss/generators",
        "title": "Generators",
        "next": "es6discuss/for-of",
        "nextText": "For/Of Loops"
    },
    {
        "page": "es6discuss/iterators-two-way",
        "title": "Two-way Iterators",
        "next": "es6discuss/coroutines",
        "nextText": "Coroutines"
    },
    {
        "page": "es6discuss/iterators",
        "title": "Iterators",
        "next": "es6discuss/iterators-two-way",
        "nextText": "Iterators (Two Way)"
    },
    {
        "page": "es6discuss/maps-sets",
        "title": "Maps and Sets",
        "next": "es6discuss/classes-private",
        "nextText": "Private Class Members"
    },
    {
        "page": "es6discuss/modules",
        "title": "Modules",
        "next": "es6discuss/promises",
        "nextText": "Promises"
    },
    {
        "page": "es6discuss/object-literals",
        "title": "Object Literals",
        "next": "es6discuss/default-values",
        "nextText": "Default Values"
    },
    {
        "page": "es6discuss/promises",
        "title": "Promises",
        "next": "es6discuss/generators",
        "nextText": "Generators"
    },
    {
        "page": "es6discuss/proxies",
        "title": "Proxies"
    },
    {
        "page": "es6discuss/rest",
        "title": "Rest Parameters",
        "next": "es6discuss/modules",
        "nextText": "Modules"
    },
    {
        "page": "es6discuss/string-interpolation",
        "title": "String Interpolation",
        "next": "es6discuss/string-methods",
        "nextText": "String/Array Methods"
    },
    {
        "page": "es6discuss/string-methods",
        "title": "String/Array Methods",
        "next": "es6discuss/classes",
        "nextText": "Classes"
    },
    {
        "page": "home",
        "title": "Home",
        "first": true,
        "next": "lessons/arrow-functions",
        "nextText": "Let's get started with our first lession -- Arrow Functions",
        "route": "/"
    },
    {
        "page": "lessons/arrow-functions-context",
        "title": "Arrow Functions (context)",
        "navGroup": ".lessons",
        "next": "lessons/destructuring",
        "nextText": "Now, let's learn about variable Destructuring."
    },
    {
        "page": "lessons/arrow-functions",
        "title": "Arrow Functions",
        "navGroup": ".lessons",
        "first": true,
        "next": "lessons/arrow-functions-context",
        "nextText": "But Arrow Functions are not exactly like regular functions.  \nLet's find out why\n"
    },
    {
        "page": "lessons/block-scope-const",
        "title": "Block Scope (const)",
        "navGroup": ".lessons",
        "next": "lessons/template-strings",
        "nextText": "Now let's look at Template Strings."
    },
    {
        "page": "lessons/block-scope-let",
        "title": "Block Scope (let)",
        "navGroup": ".lessons",
        "next": "lessons/block-scope-const",
        "nextText": "There's another way to do block scoping.  Learn about \"const\" next."
    },
    {
        "page": "lessons/classes-extended",
        "title": "Classes -- Extended",
        "navGroup": ".lessons"
    },
    {
        "page": "lessons/classes",
        "title": "Classes",
        "navGroup": ".lessons",
        "next": "lessons/classes-extended",
        "nextText": "Classes can be extended!  Find out how."
    },
    {
        "page": "lessons/default-parameters",
        "title": "Default Parameters",
        "navGroup": ".lessons",
        "next": "lessons/block-scope-let",
        "nextText": "Next, let's find out two new ways to declare variables."
    },
    {
        "page": "lessons/destructuring-arrays",
        "title": "Array Destructuring",
        "navGroup": ".lessons",
        "next": "lessons/property-shorthand",
        "nextText": "Did you notice something funny about those console.log calls?"
    },
    {
        "page": "lessons/destructuring",
        "title": "Variable Destructuring",
        "navGroup": ".lessons",
        "next": "lessons/destructuring-arrays",
        "nextText": "Destructuring isn't just for objects.  You can Destructure Arrays too!"
    },
    {
        "page": "lessons/method-shorthand",
        "title": "Method Shorthand",
        "navGroup": ".lessons",
        "next": "lessons/default-parameters",
        "nextText": "Want more shorthand syntax?  Let's talk about Default Parameters."
    },
    {
        "page": "lessons/property-shorthand",
        "title": "Property Shorthand",
        "navGroup": ".lessons",
        "next": "lessons/method-shorthand",
        "nextText": "Want more shorthand syntax?  Let's talk about Method Shorthand."
    },
    {
        "page": "lessons/template-strings-tags",
        "title": "Tagged Template Strings",
        "navGroup": ".lessons",
        "next": "lessons/classes",
        "nextText": "Classes"
    },
    {
        "page": "lessons/template-strings",
        "title": "Template Strings",
        "navGroup": ".lessons",
        "next": "lessons/template-strings-tags",
        "nextText": "Template Strings are more powerful than this when you \"tag\" them."
    }
];