---
title: Property Shorthand
navGroup: .lessons
next: lessons/method-shorthand
nextText: Want more shorthand syntax?  Let's talk about Method Shorthand.
heading: Property Shorthand
code: |
    function makeParent(first, last) {
        return {first, last, isParent: true};
    }

    console.log(makeParent('Darth', 'Vader'));
---

This feature is really just a shorthand notation for what you are used to writing for object literals.  When the variable name is the same as the object key, you can use a shorthand notation.

In other words, `{first: first, last: last}` can be written as `{first, last}`.  Shorthand notation can be mixed with traditional notation: `{first, last, isParent: true}`.

### Give it a try
