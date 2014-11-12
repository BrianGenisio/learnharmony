---
title: Array Methods
next: es6discuss/classes
nextText: Classes
heading: Array Methods
code: |
    var data = [1, 2, 3, 4];
    var firstEven = data.find(x => x % 2 === 0);
    var firstEvenIndex = data.findIndex(x => x % 2 === 0);

    console.log(firstEven);
    console.log(firstEvenIndex);

    data.fill(0);

    console.log(data);
---