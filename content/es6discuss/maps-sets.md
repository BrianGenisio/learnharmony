---
title: Maps and Sets
next: es6discuss/classes-private
nextText: Private Class Members
heading: Maps and Sets
code: |
    let key1 = new Date();
    let key2 = {foo: 'bar'};

    let map = new Map();
    map.set(key1, 'first');
    map.set(key2, 'second');

    console.log(map.get(key1), map.get(key2));

    let set = new Set([1, 2, 2, 3]);

    console.log(Array.from(set));
---
