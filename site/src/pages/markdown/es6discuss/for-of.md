---
title: For/of loops
next: es6discuss/iterators-two-way
nextText: Iterators (Two Way)
heading: For/of loops
code: |
    function* getValues() {
      yield 1;
      yield 2;
      yield 3;
    }

    for(let value of getValues()) {
      console.log(value);
    }
---
