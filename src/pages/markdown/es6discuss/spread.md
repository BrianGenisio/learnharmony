---
title: Spread Parameters
next: es6discuss/classes-extended-revisited
nextText: Class Extensions Revisited
heading: Spread Parameters
code: |
    function format(one, two, three) {
      console.log(one, two, three);
    }

    let values = [1, 2, 3];

    format(...values);
---
