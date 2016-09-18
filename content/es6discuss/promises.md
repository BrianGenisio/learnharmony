---
title: Promises
next: es6discuss/generators
nextText: Generators
heading: Promises
code: |
    var promise = new Promise((resolve, reject) => {
        setTimeout(() => resolve(55), 1000);
    });
  
    promise.then(console.log);

    var promise2 = new Promise((resolve, reject) => {
        setTimeout(() => resolve(99), 2000);
    });

    Promise.all([promise, promise2])
        .then(([v1, v2]) => console.log(v1, v2));
---