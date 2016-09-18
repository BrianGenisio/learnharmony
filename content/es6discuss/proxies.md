---
title: Proxies
heading: Proxies
code: |
  let logger = {
    get: function(target, name, receiver) {
      console.log(`getting ${ name }`);
      return target[name].toUpperCase();
    }
  };

  let person = { first: 'Brian', last: 'Genisio' };
  let proxied = Proxy(person, logger);

  console.log(proxied.first);

  let magic = Proxy({}, {
    get: (target, name, receiver) => () => console.log("hello " + name)
  });

  magic.brian();
---