---
title: Extending Classes (Revisited)
next: es6discuss/
nextText: 
heading: Revisiting Extending Classes
code: |
    class Person {
      constructor(first, last) {
        this.first = first;
        this.last = last;
      }
    }

    class Employee extends Person {
        constructor(...params) {
            super(...params);
            this.type = 'employee';
        }
    }

    var brian = new Employee('Brian', 'Genisio');

    console.log(brian);
---