export var page = {
    "title": "Method Shorthand",
    "navGroup": ".lessons",
    "next": "lessons/default-parameters",
    "nextText": "Want more shorthand syntax?  Let's talk about Default Parameters.",
    "heading": "Method Shorthand",
    "code": "var chopper = {\n    owner: 'Zed',\n    getOwner() { return this.owner; }\n};\n\nconsole.log(\"Who's chopper is this?\");\nconsole.log(\"It's \" + chopper.getOwner() + \"'s\" );",
    "intro": "<p>Much like <a href=\"/#lessons/property-shorthand\">Property Shorthand</a>, Method Shorthand is a cleaner way to define methods on objects (or Classes).  </p>\n<p>Where you may have once written something like this:</p>\n<pre><code class=\"lang-javascript\"><span class=\"hljs-keyword\">var</span> chopper = {\n    owner: <span class=\"hljs-string\">'Zed'</span>,\n    getOwner: <span class=\"hljs-function\"><span class=\"hljs-keyword\">function</span><span class=\"hljs-params\">()</span> </span>{ <span class=\"hljs-keyword\">return</span> <span class=\"hljs-keyword\">this</span>.owner; }\n};\n</code></pre>\n<p>It can be written like this:</p>\n<pre><code class=\"lang-javascript\"><span class=\"hljs-keyword\">var</span> chopper = {\n    owner: <span class=\"hljs-string\">'Zed'</span>,\n    getOwner() { <span class=\"hljs-keyword\">return</span> <span class=\"hljs-keyword\">this</span>.owner; }\n}\n</code></pre>\n<p>This may not feel like a big change, but it is particularly nice when used in Classes.</p>\n<h3 id=\"give-it-a-try\">Give it a try</h3>\n"
};