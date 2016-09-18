---
title: Object Literals
next: es6discuss/default-values
nextText: Default Values
heading: Object Literals
code: |
    let key = "someKey";
    let value = 55;

    let obj = { 
      value,
      [key + ' times 2']: value,
      toString() {
        return `The value is ${this.value}`;
      }
    };

    console.log(obj);
    console.log(obj.toString());
---
