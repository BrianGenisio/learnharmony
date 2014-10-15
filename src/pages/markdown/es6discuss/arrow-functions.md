---
title: Arrow Functions
next: es6discuss/string-interpolation
nextText: String Interpolation
heading: Arrow Functions
code: |
    var values = [1, 2, 3, 4, 5, 6];

    var even = values.filter(x => x % 2 === 0);
    var evenSquares = even.map(x => x * x);

    console.log(even, evenSquares);
---


