---
title: Block Scope (const)
navGroup: .lessons
next: lessons/template-strings
nextText: Now let's look at Template Strings.
heading: Block Scope ("const" keyword)
code: |
    const foo = "bar";
    console.log(foo);

    foo = "baz";
    
    
---

In addition to the [`let` keyword](/#lessons/block-scope-let) which is block scoped, there is another new way to declare values in ES6: `const`.  Like most languages, `const` values cannot be changed at runtime.  Any code which trys to do this will fail when the code is evaluated.

```javascript
const foo = "bar";
console.log(foo);

foo = "baz"; // evalutation error
```

### Give it a try
