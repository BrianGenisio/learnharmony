---
title: Tagged Template Strings
navGroup: .lessons
next: lessons/classes
nextText: Classes
heading: Template Strings (tags)
code: |
    function uc(strings, ...values) {
        let result = '';
        for(let string of strings) {
            result += string;
            result += (values.shift() || '').toUpperCase();
        }
  
        return result;
    }

    let processed = uc`First: ${'abc'} Second: ${'def'}`;
    console.log(processed);
---

You can have some control over how template strings get stitched together.  If you "tag" a template string, the strings and evaluated values get passed into a function of the same name.  Here is an example of a template string tag that stitches the string together but causes the values to be upper case.

```javascript
function uc(strings, ...values) {
  let result = '';
  for(let string of strings) {
    result += string;
    result += (values.shift() || '').toUpperCase();
  }
  
  return result;
}

let processed = uc`First: ${'abc'} Second: ${'def'}`;
```

You can expect JavaScript libraries of the future using tags to aid with internationalization, string formatters, HTML templates, and HTTP generators.
