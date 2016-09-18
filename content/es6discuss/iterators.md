---
title: Iterators
next: es6discuss/iterators-two-way
nextText: Iterators (Two Way)
heading: Iterators
code: |
    function iterateElements(array) {
      return {
        [Symbol.iterator]: function() {
          var index = 0;
          var current;
          return {
            next: function() {
              if (index < array.length) {
                current = array[index++];
                return {
                  value: current,
                  done: false
                };
              }
              return {
                value: undefined,
                done: true
              }
            }
          };
        }
      };
    }

    var generator = iterateElements([1,2,3]);

    for (var value of generator) {
      console.log(value);
    }
---
