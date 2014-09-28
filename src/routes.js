export var routes = [
    {
        "page": "/about",
        "title": "About"
    },
    {
        "page": "/home",
        "title": "Home",
        "first": true,
        "next": "lessons/arrow-functions",
        "nextText": "Let's get started with our first lession -- Arrow Functions",
        "route": "/"
    },
    {
        "page": "/lessons/arrow-functions-context",
        "title": "Arrow Functions (context)",
        "navGroup": ".lessons",
        "next": "lessons/destructuring",
        "nextText": "Now, let's learn about variable Destructuring."
    },
    {
        "page": "/lessons/arrow-functions",
        "title": "Arrow Functions",
        "navGroup": ".lessons",
        "first": true,
        "next": "lessons/arrow-functions-context",
        "nextText": "But Arrow Functions are not exactly like regular functions.  \nLet's find out why\n"
    },
    {
        "page": "/lessons/block-scope-const",
        "title": "Block Scope (const)",
        "navGroup": ".lessons"
    },
    {
        "page": "/lessons/block-scope-let",
        "title": "Block Scope (let)",
        "navGroup": ".lessons",
        "next": "lessons/block-scope-const",
        "nextText": "There's another way to do block scoping.  Learn about \"const\" next."
    },
    {
        "page": "/lessons/default-parameters",
        "title": "Default Parameters",
        "navGroup": ".lessons",
        "next": "lessons/block-scope-let",
        "nextText": "Next, let's find out two new ways to declare variables."
    },
    {
        "page": "/lessons/destructuring-arrays",
        "title": "Array Destructuring",
        "navGroup": ".lessons",
        "next": "lessons/property-shorthand",
        "nextText": "Did you notice something funny about those console.log calls?"
    },
    {
        "page": "/lessons/destructuring",
        "title": "Variable Destructuring",
        "navGroup": ".lessons",
        "next": "lessons/destructuring-arrays",
        "nextText": "Destructuring isn't just for objects.  You can Destructure Arrays too!"
    },
    {
        "page": "/lessons/method-shorthand",
        "title": "Method Shorthand",
        "navGroup": ".lessons",
        "next": "lessons/default-parameters",
        "nextText": "Want more shorthand syntax?  Let's talk about Default Parameters."
    },
    {
        "page": "/lessons/property-shorthand",
        "title": "Property Shorthand",
        "navGroup": ".lessons",
        "next": "lessons/method-shorthand",
        "nextText": "Want more shorthand syntax?  Let's talk about Method Shorthand."
    }
];