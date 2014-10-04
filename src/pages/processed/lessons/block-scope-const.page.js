export var page = {
    "title": "Block Scope (const)",
    "navGroup": ".lessons",
    "next": "lessons/template-strings",
    "nextText": "Now let's look at Template Strings.",
    "heading": "Block Scope (\"const\" keyword)",
    "code": "const foo = \"bar\";\nconsole.log(foo);\n\nfoo = \"baz\";",
    "intro": "<p>In addition to the <a href=\"/#lessons/block-scope-let\"><code>let</code> keyword</a> which is block scoped, there is another new way to declare values in ES6: <code>const</code>.  Like most languages, <code>const</code> values cannot be changed at runtime.  Any code which trys to do this will fail when the code is evaluated.</p>\n<pre><code class=\"lang-javascript\"><span class=\"hljs-keyword\">const</span> foo = <span class=\"hljs-string\">\"bar\"</span>;\n<span class=\"hljs-built_in\">console</span>.log(foo);\n\nfoo = <span class=\"hljs-string\">\"baz\"</span>; <span class=\"hljs-comment\">// evalutation error</span>\n</code></pre>\n<h3 id=\"give-it-a-try\">Give it a try</h3>\n"
};