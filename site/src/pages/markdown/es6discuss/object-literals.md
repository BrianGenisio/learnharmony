---
title: Object Literals
next: es6discuss/dynamic-prop-names
nextText: Dynamic Property Names
heading: Updates to Object Literals
code: |
    let value = 55;

    let obj = { 
       value,
       toString() {
         return `The value is ${this.value}`;
       }
    };

    console.log(obj.toString());
---
