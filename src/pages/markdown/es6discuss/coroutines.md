---
title: Coroutines
heading: Coroutines
code: |
    co(function *(){
      let index = yield $.get('index.html');
      let bower = yield $.get('bower.json');

      console.log(index.length);
      console.log(bower);
    })();
---
