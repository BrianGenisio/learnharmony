---
title: Rest Parameters
next: es6discuss/spread
nextText: Spreadding parameters
heading: Rest Parameters
code: |
    function format(fmt, ...values) {
      console.log(fmt, values);
    }

    format('%d: foobar, %s', 55, 'blah');
---
