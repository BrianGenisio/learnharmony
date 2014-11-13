---
title: Classes -- Extended
navGroup: .lessons
heading: Classes - Extended
code: |
    class Person {
      constructor(first, last) {
        this.first = first;
        this.last = last;
      }

      toString() {
        return `${this.first} ${this.last}`;
      }
    }

    class SuperPerson extends Person {
      constructor(first, last, power) {
        super(first, last);
        this.superPower = power;
      }

      toString() {
        return `${super.toString()} with the power of ${this.superPower}`;
      }
    }

    let brian = new SuperPerson('Brian', 'Genisio', 'code');

    console.log(brian.toString());
---

Classes can be extended using the `extends` keyword.  Methods can be overridden by re-defining them but the parent implementation can be called with `super()`;

```javascript
class SuperPerson extends Person {
  constructor(first, last, power) {
    super(first, last);
    this.superPower = power;
  }

  toString() {
    return `${super.toString()} with the power of ${this.superPower}`;
  }
}
```

### Give it a try
