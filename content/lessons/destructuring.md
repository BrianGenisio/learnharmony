---
title: Variable Destructuring
navGroup: .lessons
next: lessons/destructuring-arrays
nextText: Destructuring isn't just for objects.  You can Destructure Arrays too!
heading: Object Destructuring
code: |
    let person = {
        first: 'Marsellus',
        last: 'Wallace',
        spouse: {
            first: 'Mia',
            last: 'Wallace'
        }
    };

    let {first: husband, last, spouse: { first: wife } } = person;
    console.log(wife, husband, last);
---

Variable Destructuring is a syntactical convenience designed to help you destructure objects and arrays.  

Let's say you have a person object:
```
var person = {
    first: 'Marsellus',
    last: 'Wallace'
};
```

You can easily assign variables to these properties using destructuring:
```
let {first, last} = person;
console.log(first, last);
```

You can also assign the variables using different names:
```
let {first: fn, last: ln} = person;
console.log(fn, ln);
```

This is particularly useful when you have a function that returns two values:
```
function getResult() {
    return {
        result: 1234,
        error: null
    };
}

let {result, error} = getResult();
```

But you can also use destructuring to pass variables in:
```
function doHTTP({host, port, path}) {
    console.log(host, port, path);
}

doHTTP({
    host: 'learnharmony.org',
    port: 80,
    path: '/'
});
```

You can even destructure deeply:
```
let person = {
    first: 'Marsellus',
    last: 'Wallace',
    spouse: {
        first: 'Mia',
        last: 'Wallace'
    }
};

let {first: husband, last, spouse: { first: wife } } = person;
console.log(wife, husband, last);
```