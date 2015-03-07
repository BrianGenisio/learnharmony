# API documentation

<!-- div class="toc-container" -->

<!-- div -->

## `Methods`
* <a href="#AST">`AST`</a>
* <a href="#config">`config`</a>
* <a href="#define">`define`</a>
* <a href="#factory">`factory`</a>
* <a href="#import">`import`</a>
* <a href="#register">`register`</a>
* <a href="#require">`require`</a>
* <a href="#transform">`transform`</a>

<!-- /div -->

<!-- div -->

## `Properties`
* <a href="#bitimports">`bitimports`</a>

<!-- /div -->

<!-- /div -->

<!-- div class="doc-container" -->

<!-- div -->

## `Methods`

<!-- div -->

### <a id="AST"></a>`AST(source, options)`
<a href="#AST">#</a> [&#x24C8;](https://github.com/MiguelCastillo/bit-imports/tree/master/src/bit-imports.js#L244 "View in source") [&#x24C9;][1]

Convenience method to create an AST (Abstract Syntax Tree) from the input
source string. The ast is built with [acorn]{@link http://marijnhaverbeke.nl/acorn/},
so please feel free to check it out for details on how it works and its
options.

#### Arguments
1. `source` *(string)*: - Source string to create the AST from.
2. `options` *(Object)*: - Configuration settings passed directly into acorn. Please refer to &#91;acorn&#93;{

* * *

<!-- /div -->

<!-- div -->

### <a id="config"></a>`config([options])`
<a href="#config">#</a> [&#x24C8;](https://github.com/MiguelCastillo/bit-imports/tree/master/src/bit-imports.js#L189 "View in source") [&#x24C9;][1]

Method to configure an instance of bit imports.
<br>
<br>
config applies configuration settings to the particular instance of bit
imports. It will also create and return a new instance of bit imports with
the configuration settings passed in. The config method is generally your
primary way of configuring bit imports.

#### Arguments
1. `[options]` *(Object)*: - Configuration settings used for creating the instance of bit imports.

#### Returns
*(Bitimports)*:  Instance of bit imports

* * *

<!-- /div -->

<!-- div -->

### <a id="define"></a>`define([name], [dependencies])`
<a href="#define">#</a> [&#x24C8;](https://github.com/MiguelCastillo/bit-imports/tree/master/src/bit-imports.js#L171 "View in source") [&#x24C9;][1]

Method to define a Module using AMD format, which can be dynamically
imported.

#### Arguments
1. `[name]` *(string)*: - is the name of the module to define. If no name is present, then the last anonymous `define` is coerced to be the named module definition. An anonymous module is one with no name.
2. `[dependencies]` *(Array.<string>)*: - list of module names to be loaded before the module definition is processed and executed *(evaluated)*.

* * *

<!-- /div -->

<!-- div -->

### <a id="factory"></a>`factory(options)`
<a href="#factory">#</a> [&#x24C8;](https://github.com/MiguelCastillo/bit-imports/tree/master/src/bit-imports.js#L206 "View in source") [&#x24C9;][1]

Method that creates bit import instances. Options is the same as
[config]{@link Bitimports#config}, so please refer to that for details.

#### Arguments
1. `options` *(Object)*: - Configuration settings used for creating the instance of bit imports.

#### Returns
*(Bitimports)*:  Instance of bit imports

* * *

<!-- /div -->

<!-- div -->

### <a id="import"></a>`import(names)`
<a href="#import">#</a> [&#x24C8;](https://github.com/MiguelCastillo/bit-imports/tree/master/src/bit-imports.js#L114 "View in source") [&#x24C9;][1]

Method to asynchronously load modules

#### Arguments
1. `names` *(string|Array.<string>)*: - Module or list of modules names to load. These names map back to the paths settings Bitimports was created with.

#### Returns
*(Promise)*:  That when resolved, all the imported modules are passed
back as arguments.

* * *

<!-- /div -->

<!-- div -->

### <a id="register"></a>`register(name, deps)`
<a href="#register">#</a> [&#x24C8;](https://github.com/MiguelCastillo/bit-imports/tree/master/src/bit-imports.js#L127 "View in source") [&#x24C9;][1]

Method to define a module to be asynchronously loaded via the
[import]{@link Bitimports#import} method

#### Arguments
1. `name` *(string)*: - Name of the module to register
2. `deps` *(Array.<string>)*: - Collection of dependencies to be loaded and passed into the factory callback method.

* * *

<!-- /div -->

<!-- div -->

### <a id="require"></a>`require(names, ready, options)`
<a href="#require">#</a> [&#x24C8;](https://github.com/MiguelCastillo/bit-imports/tree/master/src/bit-imports.js#L151 "View in source") [&#x24C9;][1]

Method to get modules.

#### Arguments
1. `names` *(string | Array.<string>)*: - module name(s) to be loaded. When array is provided, the ready callback is always called to get the resulting modules.
2. `ready` *(Function)*: - Callback function, which is called when the module(s) are loaded and ready for the application to consume.
3. `options` *(Object)*: - Configuration settings specific to the &#91;require&#93;{

#### Returns
*(Promise|Module)*:  When `require` is called with a single string and
the module has already been loaded, then the actual module is returned.
This is to follow `CJS` module format. If more than one module is
`require`d, then a Promise is returned that when resolved, all the
`require`d modules are passed in.

* * *

<!-- /div -->

<!-- div -->

### <a id="transform"></a>`transform(source)`
<a href="#transform">#</a> [&#x24C8;](https://github.com/MiguelCastillo/bit-imports/tree/master/src/bit-imports.js#L220 "View in source") [&#x24C9;][1]

Convenience method to run the input string through the transformation
workflow

#### Arguments
1. `source` *(string)*: - Source string to be processed by the transformation workflow.

#### Returns
*(Promise)*:  That when resolved, the processed text is returned.

* * *

<!-- /div -->

<!-- /div -->

<!-- div -->

## `Properties`

<!-- div -->

### <a id="bitimports"></a>`bitimports`
<a href="#bitimports">#</a> [&#x24C8;](https://github.com/MiguelCastillo/bit-imports/tree/master/src/bit-imports.js#L294 "View in source") [&#x24C9;][1]

(Bitimports): `bitimports` is the default Bitimports instance available. All you need to
do if configure it with the [config]{@link Bitimports#config} method to
define how your application is structured. The goal of the configuration
step is to help you make your code simple and readable when importing and
exporting modules.
<br>
<br>
When the bit-imports module is loaded via script tag, which is the more
common use case in the browser, `bitimports` is automatically added to the
global object.  But since bit-imports is a [UMD]{@link https://github.com/umdjs/umd}
module, feel free to load it as an [AMD]{@link https://github.com/amdjs/amdjs-api/wiki/AMD}
or [CJS]{@link http://wiki.commonjs.org/wiki/Modules/1.1.1} module.
<br>
<br>
`bitimports` exposes methods such as [require]{@link Bitimports#require},
[define]{@link Bitimports#define}, [import]{@link Bitimports#import}, and
[register]{@link Bitimports#register} to provide a comprehensive system for
loading modules synchronously and asynchronously in `AMD` and `CJS` module
formats.

* * *

<!-- /div -->

<!-- /div -->

<!-- /div -->

 [1]: #methods "Jump back to the TOC."
