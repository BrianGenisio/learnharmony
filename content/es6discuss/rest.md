---
title: Rest Parameters
next: es6discuss/modules
nextText: Modules
heading: Rest Parameters
code: |
    function format(fmt, ...values) {
      console.log(fmt, values);
    }

    format('%d: foobar, %s', 55, 'blah');


    function add(one, two, three) {
      console.log(one + two + three);
    }

    let values = [1, 2, 3];
    add(...values);
---
