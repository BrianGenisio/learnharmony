---
title: Private Properties in Classes
next: es6discuss/proxies
nextText: Proxies
heading: Private Properties in Classes
code: |
    let priv = new WeakMap();

    class Person {
      constructor(first, last) {
        priv.set(this, {first, last});
      }

      get first() { return priv.get(this).first; }
      get last() { return priv.get(this).last; }
    }

    // Later, in another module
    var brian = new Person('Brian', 'Genisio');

    console.log(brian.first, brian.last);
---