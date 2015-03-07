## bit-loader [![Build Status](https://travis-ci.org/MiguelCastillo/bit-loader.svg?branch=master)](https://travis-ci.org/MiguelCastillo/bit-loader) [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/MiguelCastillo/bit-loader?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
> Module loading and dependency management micro framework designed to run in the browser and nodejs.

## Overview
bit loader is a micro framework that provides hooks for loading source files, which get put through a processing pipeline that ultimately creates modules.

The processing pipeline has two stages, with the first one being a *transformation* workflow. The transformation workflow is a very powerful tool where you get to define how *your* source files are processed.  For example, you might be using coffeescript that needs to be transformed to JavaScript.  You can add a coffeescript transform - we'll show a sample coffeescript transform below.  Or you may want to automatically add `'use strict;'` to your code before it runs...  Well you can *very* easily create a transform that does just that.

The second stage of the pipeline is a *build* workflow. Once all your source files are transformed, they are ready for the build workflow where all the transformed sources are converted to modules. And once the modules are created, they can be consumed by the host application.

> The combination of an *asynchronous* fetch and transform workflow with a *synchronous* build workflow allow us to support `CJS`,`AMD`, and `ES6 modules` simultaneously.

> In order to load source files from disk or remote servers, you need to configure a fetch provider.  It is very simple to do.  Please read the [fetch](https://github.com/MiguelCastillo/bit-loader#fetch) section for details, and checkout the example directory.

### Transformation workflow
The primary purpose of the transformation workflow is to provide *an easy* way to configure a set of processors that your source files go through before they are converted to modules.  These processors are called *transform*s, and they are methods that take in a module meta object as their only parameter.  The module meta objects will have a `source` property, which is generally what the *transform*s operate on.

So what does a *transform* that transpiles coffeescript look like? Probably like this:

#### coffeescript transform
```javascript
function compileCoffeescript(moduleMeta) {
  moduleMeta.source = coffeescript.compile(moduleMeta.source);
}
```

Here is how you can configure such transform:
``` javascript
var bitloader = Bitloader({
  "transforms": [{
    handler: compileCoffeescript
  }]
});

function compileCoffeescript(moduleMeta) {
  moduleMeta.source = coffeescript.compile(moduleMeta.source);
}
```

And here is an example of a really naive transform that adds `use strict;` to your code at run time, with an alternate way of registering a transform calling the `use` method.

#### 'use strict'; naive transform
``` javascript
var bitloader = Bitloader();
bitloader.transform.use(addStrict);

function addStrict(moduleMeta) {
  moduleMeta.source = "'use strict;'\n" + moduleMeta.source;
}
```

*That's really simple!*

The transformation workflow is [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) based, so you can return promises from your transform if you need to run async operations that the transformation workflow needs to wait for.  The execution of the transformation workflow can also be stopped by any transform that *returns false*.  This is really useful for writing transforms that handle an operation and don't need the rest of the transformation workflow to execute.  You can get more fancy and write a tranform for [6to5](https://6to5.org/) like [this one](https://github.com/MiguelCastillo/6to5-bits/blob/master/src/index.js). The 6to5 transform is actually a browserified module, so please feel free to use the *amazing* [browserify](http://browserify.org/) to generate build artifacts to be consumed by bit loader as transforms.

We have talked all about the transformation workflow, and rightfully so because that's an incredibly important part of bit loader. But there are other features that are really important as well.

### Build
>The build (compile + linking) stage is where the *transformed source* is converted to *evaluated code*, which is what a module ultimately represents.

The build workflow basically compiles (evaluates) source in order to create a module, which then goes through a linking step. In the linking step, all the module dependencies are built (if not already), and if the module has a `factory` method then it is called with all the corresponding dependencies. The act of calling the `factory` method is the the *module execution* step, and the result is the final module code that is consumed by the host application.

If the module meta object that is being built has a `compile` method, the actual compilation (evaluation) of the transformed source is delegated to that `compile` method.  If the meta module does not have a `compile` method, then bit loader will expect to use the module meta `code` property.


## Key parts and hooks

### Fetch
In order to create something useful, bit loader provides a hook for the `fetch` method, which defines how source files are read from storage. This abstraction exists to keep the process of creating modules separate from the process of *fetching* files from storage - disk, HTTP(s), or any other transport you may fancy. Bit loader itself does not implement the `fetch` method as it is intended to be provided by module loader implementations.

#### Fetch generates module Meta objects
> The point of `fetch` is to create module meta objects that bit loader can transform to build modules.

When bit loader calls the fetch method to get module meta objects, it wraps the call in a promise so that synchronous and asynchronous operations behave consistently.  This simply means that if you are implementing a `fetch` provider, feel free to return promises or module meta objects directly.

Once bit loader gets a module meta object from fetch, it will augment it with *useful* properties and methods that will help during the process of converting the module meta object to an instance of module.

Below are two examples for creating an instance of bit loader that defines a fetch method.

#### Fetch example returning a 'processed' module meta; a modue meta object with a property `code`
``` javascript
function fetchFactory(loader) {
  return {
    fetch: function(name) {
      // Notice that fetch returns a simple object with a `code` property.
      // This object returned is what we call a module meta object.
      return {code: name + " is fetched"};
    }
  }
}

var loader = new Bitloader({}, {fetch: fetchFactory});
var reuslt = loader.fetch("like")

// result is {code: 'like is fetched'}
console.log(result);
```

#### Fetch example returning an 'unprocessed' module meta; a module meta object with a method `compile` and a `source` string property
``` javascript
// When fetchFactory is called, the instance of loader is passed in.
function fetchFactory(/*loader*/) {
  function compile() {
    // `this` is an augmented meta module object that has access to manager,
    // which is the instance of loader.
    return new this.manager.Module({code: this.name + " is compiled"});
  }

  return {
    fetch: function(name) {
      // Notice that fetch returns a simple object with a `compile` method.
      // When a `compile` method is provided, a `source` property of type
      // string must also be proivded.
      // This object returned is what we call a module meta object.
      return {compile: compile, source: ""};
    }
  }
}

var loader = new Bitloader({}, {fetch: fetchFactory});
var reuslt = loader.fetch("like")

// result is {code: 'like is fetched'}
console.log(result);
```

#### Fetch is just the beginning
Fetch is just the first building block in the puzzle.  As we will see later, when you call `load` or `import` is when you start to see more relevant capabilities of bit loader.

If you would like to see a fully functionaly implementation of `fetch`, you can take a look at [bit imports](https://github.com/MiguelCastillo/bit-imports).


### Load
> The purpose of the `load` method is to return modules.

It does it by wrapping the entire process of calling fetch to get module meta objects, pushing the module meta objects through the transformation and build  workflow, and then returning the module. There are a few other steps that take place such a interacting with the cache, but they are less relevant.

`load` takes in a single string module name (or id as some other folks refer to), and it returns a `promise`.  When the promise is resolved, the loaded module is passed back as an argument to the promise callback. Please see [Module](https://github.com/MiguelCastillo/bit-loader#module) below for more details on module.

#### Sample `load` call
```javascript
var bitloader = new Bitloader();

bitloader.load('modA').then(function(modA) {
  console.log(modA);
});
```
#### Give me a bit of visual...
<img src="https://raw.githubusercontent.com/MiguelCastillo/bit-loader/master/img/Module-Meta-Transform.png" alt="Loader diagram" height="300px"></img>


### Import
> The primary purpose of `import` is to return the *evaluated code* from modules.

The `import` method is basically the replacement for `require`, which returns the actual *evaluated code*.  In contrast, `load` returns the entire module.  Internally, `import` will call `load` to do the heavy lifting and `import` simply unwraps the module returning only the `code` property.

`import` can take a single string module name or an array of string module names, and it returns a promise.  When the promise is resolved, all the loaded module(s) are passed back as arguments to the promise callback.

### Sample code for importing a pair of modules
``` javascript
var bitloader = new Bitloader();

bitlaoder.import(["modA", "modB"].then(function(modA, modB) {
  // Console prints the actual evaluated code
  console.log(modA, modB);
});
```

### Register
> Method to add a module that can be imported via the `import` interface.

When a module meta object is registered, importing it will cause the module meta to completely skip the fetch and transformation steps, making the module meta readily available for the build workflow to create modules.

The first parameter is the name of the module to register, the second parameter is an array of dependency names, and third is a function known as the module `factory`.  The `factory` function is called with all the dependencies defined in the second parameter. Again, the act of calling `factory` is the module execution step, and the result is the module code consumed by the host application.

```javascript
var bitloader = new Bitloader();
bitlaoder.register("modA", ["modB"], function(modB) {
  return "Anything";
});

bitloader.import("modA").then(function(modA) {
  // Console will print "Anything";
  console.log(modA);
});

bitloader.load("modA").then(function(modA) {
  // Console will print the Module instance
  console.log(modA);
});

```

### Module
> Modules are the final product of the entire load process.

A module is an object that represents the *evaluated code*. A module has information such as its canonical name, dependencies' names, URL, and other information used during the creation of the module itself.  The most important property of them all is `code`, which is the *evaluated code* which is what the host application consumes.

#### Sample Module instance
```javascript
{
  name: "modA",
  code: "Anything",
  deps: [],
  meta: {
    source: "..."
  }
}
```

> Closing the loop on what `load` and `import` return when they are called. `load` will return then entire module and `import` will return the `code` property.

### Module Meta
> Module meta objects are plain ole JavaScript objects that serve as an intermediate representation of a module.

A module meta object has a couple of properties and or methods used by bit loader in order to create, or delegate the process of creating modules, and they are explained below.

#### Processed Module Meta
The most basic form of module meta is called 'processed' module meta, which is an object with a property `code` that is used by bit loader itself to create a module. `code` is what a module represents; it is the *stuff* that calling `require` in `AMD` and `CJS` return that is used by the host application.

> Module meta objects with a `code` property *do not* go through the transformation workflow.

#### Unprocessed Module Meta
Alternatively, we have 'unprocessed' module meta objects, which are also plain ole JavaScript objects with a `source` string property and a `compile` method.  When bit loader detects these two properties, the process of creating modules is delegated to the `compile` method. In other words, bit loader will call `compile` which returns a module. An important feature of 'unprocessed' module meta objects is that bit loader puts them through the transformation workflow.

> Module meta objects with a `compile` and `source` properties go through the transformation workflow.

#### Differences?
One important distinction between the two is that bit loader will push 'unprocessed' module meta objects through the transformation workflow; 'processed' meta object skip that step entirely. The reason for this is that `source` is the raw text (source code) that will eventually be converted to `evaluated code`; `source` becomes `code` by calling [eval](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval) - or whatever other equivalent source evaluation mechanism you may have.  We want to put `source` through the transformation workflow to do fancy things like converting it from coffeescript to JavaScript. `code` is ultimately what a module actually represents.  It is the *stuff* you get when you call `require` or ES6 `import`.

## Examples
There are several examples that can be executed in node.  The examples are meant to illustrate how you can use bit loader.  Please see the example directory.


## Architecture Notes

#### Import workflow
* import
* fetch
  * resolve name, which creates moduleMeta
  * set moduleMeta source
  * set moduleMeta compile method
  * return moduleMeta
* transform
  * run custom transforms
  * parse out dependencies
* fetch dependencies from transformation step
* async build

#### Sync build - Used when a module is executing
* compile (evaluate moduleMeta.source) to create module
* link module
  * call factory with dependencies
  * assign factory result to module.code

#### Async build - Used when loading a module (`System.import`)
* compile (evaluate moduleMeta.source) to create module
* check if the compilation step caused a System.register
  * load dependencies from System.register call
* link module
  * call factory with dependencies
  * assign factory result to module.code

## Reference diagrams

### Loader diagram
<img src="https://raw.githubusercontent.com/MiguelCastillo/bit-loader/master/img/Loader.png" alt="Loader diagram" height="600px"></img>

### Fetch diagram
<img src="https://raw.githubusercontent.com/MiguelCastillo/bit-loader/master/img/Loader-Fetch.png" alt="Fetch diagram" height="600px"></img>

### Pipeline diagram
<img src="https://raw.githubusercontent.com/MiguelCastillo/bit-loader/master/img/Loader-Pipeline.png" alt="Pipeline diagram" height="600px"></img>
