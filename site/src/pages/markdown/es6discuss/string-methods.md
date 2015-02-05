---
title: String/Array Methods
next: es6discuss/classes
nextText: Classes
heading: String/Array Methods
code: |
    var name = "John Oliver";
    var data = [1, 2, 3, 4];

    console.log(name.startsWith("John"));
    console.log(name.endsWith("Oliver"));
    console.log(name.includes("live"));
    console.log("derp ".repeat(3));

    console.log(data.find(x => x % 2 === 0));
    console.log(data.findIndex(x => x % 2 === 0));
    console.log(data.fill(0));
---


