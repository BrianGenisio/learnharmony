# babel-bits
> [babel](https://www.npmjs.com/package/babel-core) plugin for [bit runner](https://github.com/MiguelCastillo/bit-runner) and transform for [bit imports](https://github.com/MiguelCastillo/bit-imports).

### Install
```
npm install babel-bits
```

### Configuration [bit runner](https://github.com/MiguelCastillo/bit-runner) `bitrunnerfile.js`

#### Run babel
``` javascript
var bitRunner = require('bit-runner');
var babel     = require('babel-bits');

/**
 * JavaScript pipeline
 */
bitRunner.register('default', function buildPipeline(task) {
  task
    .load('index.js')
    .then(babel)
});
```

#### Configure and run babel

The configuration settings are passed right to [babel](https://babeljs.io), so please refer to their [docs](https://babeljs.io/docs/usage/options/) for details on the available options.

``` javascript
var bitRunner = require('bit-runner');
var babel     = require('babel-bits');

/**
 * JavaScript pipeline
 */
bitRunner.register('default', function buildPipeline(task) {
  task
    .load('index.js')
    .then(babel.config({ast: false}))
});
```


### Configuration [bit-imports](https://github.com/MiguelCastillo/bit-imports)

#### Via configuration
```javascript
bitimports.config({
  "transforms": [{
    "name": "node_modules/babel-bits/dist/index.js",
    "options": {
      "ast": false
    }
  }]
});
```

#### Via method
```javascript
bitimports.transform.use({
  name: "node_modules/babel-bits/dist/index.js",
  options: {
    ast: false
  }
});
```

### Note on *generators
[babel](https://babeljs.io/) needs an external tool called [regenerator](https://github.com/facebook/regenerator) in order to support `generator`s.  To bring `generator` support into your application, you can just load [regenerator](https://github.com/facebook/regenerator) via script tag (or equivalent) and all `generator` code produced by babel will run just fine.  The idea here is that the code produced by babel can find the method `regeneratorRuntime` whenever it is executed.

#### Example with fully configured bit imports running babel with generator support in the browser
```html
<script src="node_modules/regenerator/runtime.js"></script>
<script src="node_modules/bit-imports/dist/bit-imports.js"></script>

<!-- You have to bootstrap an instance of bit imports. -->
<script>
var System = (function() {
  var importer = bitimports.config({
    "paths": {
      "babel": "node_modules/babel-bits/dist/index.js"
    },
    "transforms": [{
        name: "ignore",
        handler: ignore,
        ignore: ["babel"]
      }, {
        name: "babel"
      }]
  });

  /**
   * Simple filter for excluding particular modules from being processed by
   * the transformation pipeline.
   */
  function ignore(moduleMeta) {
    var ignoreList = this.ignore;
    return !(ignoreList && ignoreList.length && ignoreList.indexOf(moduleMeta.name) !== -1);
  }

  return importer;
}());

var require = System.require;
</script>

<!-- Now you can load your ES6 application with support for generators -->
<script>System.import("src/app");</script>
```
