export var page = {
    "title": "Classes -- Extended",
    "navGroup": ".lessons",
    "heading": "Classes - Extended",
    "code": "class Person {\n  constructor(first, last) {\n    this.first = first;\n    this.last = last;\n  }\n\n  toString() {\n    return `${this.first} ${this.last}`;\n  }\n}\n\nclass SuperPerson extends Person {\n  constructor(first, last, power) {\n    super(first, last);\n    this.superPower = power;\n  }\n\n  toString() {\n    return `${super.toString()} with the power of ${this.superPower}`;\n  }\n}\n\nlet brian = new SuperPerson('Brian', 'Genisio', 'code');\n\nconsole.log(brian.toString());",
    "intro": "<p>Classes can be extended using the <code>extends</code> keyword.  Methods can be overridden by re-defining them but the parent implementation can be called with <code>super()</code>;</p>\n<pre><code class=\"lang-javascript\"><span class=\"hljs-class\"><span class=\"hljs-keyword\">class</span> <span class=\"hljs-title\">SuperPerson</span> <span class=\"hljs-keyword\">extends</span> <span class=\"hljs-title\">Person</span> </span>{\n  constructor(first, last, power) {\n    <span class=\"hljs-keyword\">super</span>(first, last);\n    <span class=\"hljs-keyword\">this</span>.superPower = power;\n  }\n\n  toString() {\n    <span class=\"hljs-keyword\">return</span> <span class=\"hljs-string\">`<span class=\"hljs-subst\">${super.toString()}</span> with the power of <span class=\"hljs-subst\">${this.superPower}</span>`</span>;\n  }\n}\n</code></pre>\n<h3 id=\"give-it-a-try\">Give it a try</h3>\n"
};