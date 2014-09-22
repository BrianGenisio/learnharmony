---
title: Arrow Functions (context)
navGroup: .lessons
next: lessons/destructuring
nextText: Now, let's learn about variable Destructuring.
heading: Arrow Functions -- Context
code: |
    // this === window
    let printThis = () => console.log(this.toString());

    printThis();
    printThis.call({thisIs: 'window'});
    printThis.apply({thisIsAlso: 'window'});
    printThis.bind({thisIsStill: 'window'})();
---

### How are Arrow Functions different from regular functions?

There are two differences:

0. **Function context (this) has lexical scope**
Basically, this means that `this` is the `this` from the scope that defines the function, not the context that calls you. Context modifiers (`call`, `apply`, `bind`, etc) have no affect over the value of `this`.  See the example below

0. **Arror Functions are not constructors**
You can't use the "new" operator on Arror Functions.  In other words, this will result in a type error:
```
let NotGood = () => {};
let wontWork = new NotGood();
```

> Note: this repl loop won't display this behavior, but don't let it fool you.  The spec doesn't allow it.


