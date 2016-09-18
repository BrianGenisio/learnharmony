---
title: Coroutines
next: es6discuss/maps-sets
nextText: Maps and Sets
heading: Coroutines
code: |
    co(function *(){
      let index = yield $.get('index.html');
      let bower = yield $.get('bower.json');

      console.log(index.length);
      console.log(bower);
    })();
---
<script src="bower_components/co/co.js"></script>
<script src="bower_components/setimmediate/setImmediate.js"></script> 