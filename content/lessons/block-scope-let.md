---
title: Block Scope (let)
navGroup: .lessons
next: lessons/block-scope-const
nextText: There's another way to do block scoping.  Learn about "const" next.
heading: Block Scope ("let" keyword)
code: |
    function blockScoped() {
        if(true) {
            let zed = 'alive'; 
        }

        console.log("Zed is " + zed);
    }

    blockScoped();
    
---

Up until ES6, variables (`var`) are always function scoped.  It doesn't matter where you define your variable -- the variable is available anywhere within the function.  This allows you to write code that you wouldn't expect to work:

```javascript
function fnScoped() {
    if(true) {
        var zed = 'alive'; // zed is "hoisted" to the function block
    }

    if(true) {
        console.log('zed is ' + zed); // zed is visible
    }
}
```

In ES6, the `let` keyword allows you to define variables within the scope of the block (block scoping).  This makes variables behave more like what you might expect.

```javascript
function blockScoped() {
    if(true) {
        let zed = 'alive'; // zed is not "hoisted" out of this block
    }

    console.log('zed is ' + zed); // zed is not visible
}
```

Because of this, I'm starting to write all of my variables using `let` instead of `var` unless I really want function scope, which is rare.

### Give it a try
