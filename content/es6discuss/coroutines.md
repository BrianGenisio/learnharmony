---
title: Coroutines
next: es6discuss/maps-sets
nextText: Maps and Sets
heading: Coroutines
code: |
    co(function* doit(){
      const index = yield fetch('index.html').then(r => r.text());
      const icon = yield fetch('favicon.ico').then(r => r.blob());

      console.log(index.length);
      console.log(icon.size);
    });
---
<script src="bower_components/co/co.js"></script>
<script src="bower_components/setimmediate/setImmediate.js"></script> 