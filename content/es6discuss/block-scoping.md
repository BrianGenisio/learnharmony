---
title: Block Scoping
next: es6discuss/const
nextText: Const values
heading: Block Scoping
code: |
    function testBlockScoping() {
      if(true) {
        var functionScoped = 'function';
        let blockScoped = 'block';
      }

      console.log(functionScoped, blockScoped);
    }

    testBlockScoping();
---
