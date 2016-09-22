---
title: Generators
next: es6discuss/for-of
nextText: For/Of Loops
heading: Generators
code: |
    function* getValues() {
      yield 1;
      yield 2;
      yield 3;
    }

    let generator = getValues();
    console.log(generator.next());
    console.log(generator.next());
    console.log(generator.next());
    console.log(generator.next());
---
