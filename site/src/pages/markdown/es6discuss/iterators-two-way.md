---
title: Two-way Iterators
next: es6discuss/coroutines
nextText: Coroutines
heading: Two-way Iterators
code: |
    function* getValues() {
      let first = yield 1;
      let second = yield 2 * first;
      yield 3 * second;
    }

    let generator = getValues();
    console.log(generator.next());
    console.log(generator.next(10));
    console.log(generator.next(20));
    console.log(generator.next());
---
