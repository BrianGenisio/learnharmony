# babel-bits
> [babel](https://www.npmjs.com/package/babel-core) plugin for [bit runner](https://github.com/MiguelCastillo/bit-runner) and transform for [bit imports](https://github.com/MiguelCastillo/bit-imports).

### Install
```
npm install babel-bits
```

### Configuration for [bit-imports](https://github.com/MiguelCastillo/bit-imports)

Options are forwarded right to [babel](https://babeljs.io/). Take a look at all available [options](https://babeljs.io/docs/usage/options/) to fine tune babel. *bit imports will automatically handle `filename`.*

You can take a look at [bit sandbox](https://github.com/MiguelCastillo/bit-sandbox) for a sample where you can play with babel in the browser.


#### plugin method
```javascript
bitimports.plugin("js", {
  transform: {
    handler: "babel",
    options: {
      sourceMaps: "inline"
    }
  }
});
```

Or alternatively:

#### plugin config
```javascript
bitimports.config({
  plugins: {
    js: {
      transform: {
        handler: "./node_modules/babel-bits/dist/index.js",
        options: {
          ast: false,
          sourceMaps: "inline"
        }
      }
    }
  }
});
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

### Note on *generators
[babel](https://babeljs.io/) needs an external tool called [regenerator](https://github.com/facebook/regenerator) in order to support `generator`s.  To bring `generator` support into your application, you can just load [regenerator](https://github.com/facebook/regenerator) via script tag (or equivalent) and all `generator` code produced by babel will run just fine.  The idea here is that the code produced by babel can find the method `regeneratorRuntime` whenever it is executed.
