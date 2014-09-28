---
title: Default Parameters
navGroup: .lessons
next: lessons/block-scope-let
nextText: Next, let's find out two new ways to declare variables.
heading: Default Parameters
code: |
    function logDefaults(a = 1, b = 2, c = 3) {
        console.log({a, b, c});
    }

    logDefaults();

    function logDestructuredDefaults({a:A = 1, b:B, c:C = 3}) {
        console.log({A, B, C});
    }

    logDestructuredDefaults({b: 2});

    let {a=1, b=2, c=3} = {};
    console.log({a, b, c});
---

You have probably wanted it for a long time.  FINALLY!  You can define default values for parameters. Defaults can be assigned to any parameter. You can even assign default values to destructured values (both as function parameters and non-function destructuring).

### Give it a try
