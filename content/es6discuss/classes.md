---
title: Classes
next: es6discuss/classes-extended
nextText: Extending Classes
heading: Classes
code: |
    class Person {
      constructor(first, last) {
        this.first = first;
        this.last = last;
      }
    }

    var brian = new Person('Brian', 'Genisio');

    console.log(brian);
---