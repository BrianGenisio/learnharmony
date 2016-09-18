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
    console.log(generator.next(100));
    console.log(generator.next(200));
    console.log(generator.next());
---
