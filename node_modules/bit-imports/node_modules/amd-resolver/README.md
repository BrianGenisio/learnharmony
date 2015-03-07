# amd-resolver [![Build Status](https://travis-ci.org/MiguelCastillo/amd-resolver.svg?branch=master)](https://travis-ci.org/MiguelCastillo/amd-resolver) [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/MiguelCastillo/amd-resolver?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

>Create module meta objects from module names using configuration options compatible with [RequireJS](http://requirejs.org/docs/api.html#config). Such module meta objects can be used by Module Loaders to download and process module files in the Browser. The module meta format is described [here](#returns-object---module-meta)

### API

#### Resolver(options : object) : constructor
Resolver - provides the means to convert a module name to a module meta object. A module meta object contains information such as a url, which can be used for fetching the module file from a remote sever.

##### Parameters

- **`options`** *{object}* - is a configuration options object with information for creating module meta objects.  It is compatible with requirejs settings for `paths`, `packages`, `baseUrl`, `shim`, and `urlArgs`.
  - **`baseUrl`** *{string}* - path that every file is relative to.
  - **`paths`** *{object}* - is an object with key value pairs to map module names to files.

    For example, if you wanted to have a module called `md5` and you wanted to map that to the location of the actual file, you can specify the following:

    ``` javascript
    {
      "paths": {
        "md5": "path/to/file/md5"
      }
    }
    ```

    That will tells resolver that the location for `md5` is `path/to/file/md5.js`.

  - **`packages`** *{array}* - is an array of directory aliases to files. Think npm packages that load `index.js` by default.

    A package can be a string, in which case resolver will generate urls in the form of `packagename/main.js`. That is to say that if you have a package called `machines`, then resolving `machines` will generate a url to `machinge/main.js`.

    Alternatively, a package can be an object which provides more granual control of the resolution process. The following properties are supported:

    - **`location`** *{string}* - which is the location on disk.
    - **`main`** *{string}* - file name. Provide one if the module file is other than `main.js`.
    - **`name`** *{string}* - package name.

  - **`shim`** *{object}* - maps code in the global object to modules.  An example of this is `Backbone`, which is loaded into the global object.  So, in order for Module Loaders to load `Backbone`, they need to know how to find `Backbone` in the global object and also know its dependencies (`underscore`) in case `Backbone` needs to be loaded.

    Shims provides two properties:

    - **`exports|name`** *{string}* - The name of the code in the global object.
    - **`imports|deps`** *{array}* - List of dependencies.  This is important when the shim has not yet been loaded and it requires other modules to be loaded first.


##### Example:

``` javascript
var resolver = new Resolver({
  "urlArgs": 'bust=' + (new Date()).getTime(),
  "baseUrl": "../",
  "paths": {
    "mocha": "../node_modules/mocha/mocha",
    "chai": "../node_modules/chai/chai"
  },
  "shim": {
    "mocha": {
      "exports": "mocha",
      "imports": ["sinon", "chai"]
    }
  },
  "packages": [
    "pacakge1", {
      "main": "index.js"
    }, {
      "location": "good/tests",
      "main": "index",
      "name": "js"
    }, {
      "location": "good/tests",
      "name": "lib"
    }
  ]
});
```

#### resolve(name : string, baseUrl : string)

Creates a module meta object. If `name` starts with `./`,  `../`, or a protocol, then the resolution process will build a module meta with a URL using the input `baseUrl` (if available). The URL is built using [this](http://nodejs.org/api/url.html#url_url_resolve_from_to) routine. *If* `name` starts with anything else, then the resolution process will use the `baseUrl` configured in the resolver ignoring the one passed it.

##### Parameters

  - **`name`** *{string}* - Name of the module to create a module meta object for. The name can be formatted with plugins such as `css!filename.css`.
  - **`baseUrl`** *{string}* - URL to be used as a base *only* when the name of the module starts with `./`, `../`, or a protocol.  Otherwise, it is ignored.

##### Returns {object} - module meta

  - **`name`** *{string}* - Name of the module being resolved. Plugin definitions are not included.
  - **`file`** *{File}* [deprecated] - File object with a URL that can be used to request the module file from a remote server.
  - **`url`** *{Url}* - Url object that's compliant with [URL Api](https://developer.mozilla.org/en-US/docs/Web/API/URL).
  - **`plugins`** *{array}* - Array of strings created from the input module `name`. Anything at the beginning of the module `name` that is delimited by a `!` will be processed as a plugin.
  - **`shim`** *{object}* - Object containing information about modules that exist in the global object. `shim` can specify a couple of things.
    - **`name`** *{string}* - Name module has in the global space.
    - **`deps`** *{array}* - Array of string of dependencies that need to be loaded before the shim.

##### Examples:

Create module meta objects
``` javascript
var mochaModuleMeta    = resolver.resolve("mocha"),
    package1ModuleMeta = resolver.resolve("package1"),
    cssModuleMeta      = resolver.resolve("css!less!path/to/file.less");
```

Urls
``` javascript
var mochaUrl    = mochaModuleMeta.url.href,    // url === "../node_modules/mocha/mocha.js"
    package1Url = package1ModuleMeta.url.href, // url === "package1/index.js"
    cssUrl      = cssModuleMeta.url.href;      // url === "path/to/file.less"
```

Plugins
``` javascript
var cssPlugins = cssModuleMeta.plugins; // plugins === ["css", "less"]
```

Shim
``` javascript
var mochaShim = mochaModuleMeta.shim; // shim === {name: "mocha", deps: ["sinon", "chai"]}
```

### Install

#### From npm

```
npm install amd-resolver
```
