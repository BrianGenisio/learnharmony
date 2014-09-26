---
title: Method Shorthand
navGroup: .lessons
next: lessons/default-parameters
nextText: Want more shorthand syntax?  Let's talk about Default Parameters.
heading: Method Shorthand
code: |
    var chopper = {
        owner: 'Zed',
        getOwner() { return this.owner; }
    };

    console.log("Who's chopper is this?");
    console.log("It's " + chopper.getOwner() + "'s" );
---

Much like [Property Shorthand](/#lessons/property-shorthand), Method Shorthand is a cleaner way to define methods on objects (or Classes).  

Where you may have once written something like this:

```javascript
var chopper = {
    owner: 'Zed',
    getOwner: function() { return this.owner; }
};
```

It can be written like this:

```javascript
var chopper = {
    owner: 'Zed',
    getOwner() { return this.owner; }
}
```

This may not feel like a big change, but it is particularly nice when used in Classes.

### Give it a try
