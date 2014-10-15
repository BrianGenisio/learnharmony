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

      try {
        console.log(functionScoped, blockScoped);
      } catch(e) {
        console.log('FAILED!!');
      }
    }

    testBlockScoping();
---
