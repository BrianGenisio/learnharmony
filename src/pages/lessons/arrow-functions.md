---
title: Arrow Functions
navGroup: .lessons
first: true
next: lessons/arrow-functions-context
nextText: |
    But Arrow Functions are not exactly like regular functions.  
    Let's find out why
heading: Arrow Functions
code: |
    var values = [1, 2, 3, 4, 5, 6];

    var even = values.filter(x => x % 2 === 0);
    var evenSquares = even.map(x => x * x);

    console.log(even, evenSquares);
---

Arrow Functions are a shorthand for anonymous functions in JavaScript.  For the most part, they behave just like normal, anonymous functions but with a lighter syntax.

A standard function can be described as 

```
var myFunction = function(arg) { 
    return arg.toUpperCase(); 
};
```

With Arrow Functions, you can write the same thing: 
```
var myFunction = (arg) => arg.toUpperCase();
```

### Where will you use Arrow Functions?
Arrow Functions are particularly useful when passing anonymous functions into other functions.  For instance, the syntax for filtering and mapping values becomes much more terse.

### Give it a try!


