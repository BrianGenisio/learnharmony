---
title: Array Destructuring
navGroup: .lessons
next: lessons/property-shorthand
nextText: Did you notice something funny about those console.log calls?
heading: Array Destructuring
code: |
    let a = 1, b = 2;
    [b, a] = [a, b];
    console.log({a, b});
---

Destructuring works on Arrays as well.

```
var [first, last] = ['Marsellus', 'Wallace'];
console.log(first, last);
```

So this means that you can easily swap two elements in an array.
```
let a = 1, b = 2;
[b, a] = [a, b];
console.log({a, b});
```

You can also skip over items you don't care about.
```
let [,,third] = [1, 2, 3];
console.log({third});
```

You can even use the "spread" operator to get the remaining items in an array.
```
let [first, ...remaining] = [1, 2, 3, 4, 5];
console.log(first);
console.log(remaining);
```