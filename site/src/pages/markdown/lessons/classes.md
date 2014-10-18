---
title: Block Scope (let)
navGroup: .lessons
next: lessons/block-scope-const
nextText: There's another way to do block scoping.  Learn about "const" next.
heading: Block Scope ("let" keyword)
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

    let brian = new Person('Brian', 'Genisio');

    console.log(brian.toString());
---

Classes are now first-class concepts in JavaScript.  Having a syntax for class declaration standardizes the class definition approaches.  It enables extension, super, and static capabilities in a well-defined, expected way.

Classes are mostly made up of a special "constructor" method, and any other method you may need on the class.  Prototypal inheritance will happen to new objects just like the ES5 mechanism of adding functoins to a class's prototype.

```javascript
class Person {
  constructor(first, last) {
    this.first = first;
    this.last = last;
  }

  toString() {
    return `${this.first} ${this.last}`;
  }
}
```

### Give it a try
