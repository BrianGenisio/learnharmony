---
title: Coroutines
heading: Coroutines
code: |
    co(function *(){
      let a = yield get('http://google.com');
      let b = yield get('http://yahoo.com');
      let c = yield get('http://cloudup.com');
  
      console.log(a[0].statusCode);
      console.log(b[0].statusCode);
      console.log(c[0].statusCode);
    })();
---
