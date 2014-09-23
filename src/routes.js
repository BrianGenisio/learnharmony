export var routes = [
    {
        "page": "about",
        "title": "About"
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
        "page": "lessons/destructuring-arrays",
        "title": "Array Destructuring",
        "navGroup": ".lessons"
    },
    {
        "page": "lessons/destructuring",
        "title": "Variable Destructuring",
        "navGroup": ".lessons",
        "next": "lessons/destructuring-arrays",
        "nextText": "Destructuring isn't just for objects.  You can Destructure Arrays too!"
    }
];