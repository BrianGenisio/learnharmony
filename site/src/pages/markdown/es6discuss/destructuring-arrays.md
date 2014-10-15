---
title: Destructuring Arrays
next: es6discuss/rest
nextText: Rest parameters
heading: Destructuring Arrays
code: |
    let point = [3, 4];

    let [x, y] = point;

    console.log(x, y);

    // Nice shorthand for swapping
    [y, x] = [x, y];

    console.log(x, y);
---
