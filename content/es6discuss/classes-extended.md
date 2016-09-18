---
title: Extending Classes
next: es6discuss/block-scoping
nextText: Block Scoping
heading: Extending Classes
code: |
    class Person {
      constructor(first, last) {
        this.first = first;
        this.last = last;
      }
    }

    class Employee extends Person {
        constructor(first, last) {
            super(first, last);
            this.type = 'employee';
        }
    }

    var brian = new Employee('Brian', 'Genisio');

    console.log(brian);
---