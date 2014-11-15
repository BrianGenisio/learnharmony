---
title: Destructuring Objects/Arrays
next: es6discuss/rest
nextText: Rest/Spread parameters
heading: Destructuring Objects/Arrays
code: |
    let person = {
      first: 'Brian',
      last: 'Genisio'
    };
    let point = [3, 4]

    var {first, last} = person;
    let [x, y] = point;

    console.log(first, last);
    console.log(x, y);

    // Nice shorthand for swapping
    [y, x] = [x, y];

    console.log(x, y);
---
