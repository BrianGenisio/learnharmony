---
title: Object Literals -- Dynamic Properties
next: es6discuss/default-values
nextText: Default Values
heading: Dynamic Property Names
code: |
    function make(key, value) {
      return {
        [key]: value
      }
    }

    var made = make('foo', 'bar');

    console.log(made);
---
