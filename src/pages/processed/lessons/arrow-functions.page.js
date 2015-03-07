export var page = {
    "title": "Arrow Functions",
    "navGroup": ".lessons",
    "first": true,
    "next": "lessons/arrow-functions-context",
    "nextText": "But Arrow Functions are not exactly like regular functions.  \nLet's find out why\n",
    "heading": "Arrow Functions",
    "code": "var values = [1, 2, 3, 4, 5, 6];\n\nvar even = values.filter(x => x % 2 === 0);\nvar evenSquares = even.map(x => x * x);\n\nconsole.log(even, evenSquares);",
    "intro": "<p>Arrow Functions are a shorthand for anonymous functions in JavaScript.  For the most part, they behave just like normal, anonymous functions but with a lighter syntax.</p>\n<p>A standard function can be described as </p>\n<pre><code><span class=\"hljs-keyword\">var</span> myFunction = <span class=\"hljs-function\"><span class=\"hljs-keyword\">function</span><span class=\"hljs-params\">(arg)</span> </span>{ \n    <span class=\"hljs-keyword\">return</span> arg.toUpperCase(); \n};\n</code></pre><p>With Arrow Functions, you can write the same thing: </p>\n<pre><code><span class=\"hljs-reserved\">var</span> myFunction = <span class=\"hljs-function\"><span class=\"hljs-params\">(arg)</span> =&gt;</span> arg.toUpperCase();\n</code></pre><h3 id=\"where-will-you-use-arrow-functions-\">Where will you use Arrow Functions?</h3>\n<p>Arrow Functions are particularly useful when passing anonymous functions into other functions.  For instance, the syntax for filtering and mapping values becomes much more terse.</p>\n<h3 id=\"give-it-a-try-\">Give it a try!</h3>\n"
};