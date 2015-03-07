bit imports
==========

[![Build Status](https://travis-ci.org/MiguelCastillo/bit-imports.svg)](https://travis-ci.org/MiguelCastillo/bit-imports)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/MiguelCastillo/bit-imports?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> Module loader and dependency management with support for CJS and AMD.

bit imports supports loading module with CJS and AMD format in the browser. And because it is built on top of [bit loader](https://github.com/MiguelCastillo/bit-loader), you get a full transformation workflow. Bit imports also uses [amd resolver](https://github.com/MiguelCastillo/amd-resolver) as the configuration provider, which is modeled after [requirejs](http://requirejs.org/docs/api.html#config) configuration format to give you a familar environment for setting things up.

Currently, bit imports implements an XHR fetch provider to load files. It also leverages `# sourceURL` to integrate with debugging capabilities in all major browsers. The plan is to have logic to detect if bit imports is running in the browser or nodejs so that files can be loaded transparently regardless of environment.

So why does bit imports even exist? Bottom line - to provide you with a flexible module loader that supports `CJS` and `AMD` without a *build* step during the development cycles of your application. Furthermore, to provide you with a module loading system that allows you to leverage tools like [babel](https://github.com/babel/babel) to unlock access to the latest ECMAScript features via transpilation, right in the browser with little configuration. Take a look at [bit tranforms sandbox](https://github.com/MiguelCastillo/bit-transforms-sandbox) where `ES6`, `AMD`, and `CJS` modules are all *harmoniously* running together in the browser without a build step.

>  A workflow that works really well is one in which your web application simply does not have a *build* step during development, and all external dependencies (toolkits and frameworks) consumed by the application itself are generally prebundled with browserify (or similar tool).  The key is in the separation of what is application code and external dependencies. Your code vs someone else's code. All your application needs is a way to load dependencies without needing a build step for each and every change made to the code. Only when the application is ready for deployment are you encouraged to bundle everything up with tools such as *browserify*.


#### Install
```
$ npm install bit-imports
```

#### [API](https://github.com/MiguelCastillo/bit-imports/tree/master/api)
#### [Examples](https://github.com/MiguelCastillo/bit-imports/tree/master/example)
