> This is a sample page to illustrate how to use bit imports as yor module loader.

A running version of this sample page is available [here](https://miguelcastillo.github.io/bit-imports/example/). It is entirely written leveraing ES2015 features and transpiled with [babeljs](https://babeljs.io/) in the browser.

## [index.html](index.html)

First, we load bit imports via a *traditional* script tag. When bit imports is loaded that way, `bitimports` is available in the global object. Then we load `config.js` to configure bit imports with relevant information to run the sample page.  And finally we load `main.js` by calling `System.import('main')`.

## [config.js](config.js)

In the configuration code, bit imports is configured in a self executing function to stop setup details from leaking into the global space.

- `baseUrl` is configured to make sure all modules have the proper root url when they are loaded.
- `paths` allows us to map module names to file location, which makes your code more concise when loading modules.
- `transform` allows us to configure processors for source files. An example of a transform is [babeljs](https://github.com/babel/babel) transform. The vast majority of this sample application is written in ES6 by leveraging [babel bits](https://github.com/MiguelCastillo/babel-bits).

``` javascript
var System = (function() {
  var importer = bitimports.config({
    "baseUrl": ".",
    "paths": {
      "babel": "../node_modules/babel-bits/dist/index.min.js",
    }
  });

  importer.plugin("js", {
    transform: {
      handler: "babel",
      options: {
        sourceMap: "inline"
      }
    }
  });

  return importer;
})();

var require = System.require;
```

## Running the example

In order to run the example in MacOS, you need to

```
git clone https://github.com/MiguelCastillo/bit-imports/ && cd bit-imports
npm install
grunt example
```
