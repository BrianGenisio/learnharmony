## bundler

The bundler example illustrates how to create a plugin with a module resolver.  The resolver used is [browser-resolve](https://github.com/defunctzombie/node-browser-resolve), which processes `package.json` and supports the `browser` field. This integration gives us full support for loading node modules, which we use for bundling [react](https://facebook.github.io/reactjs).

A [babeljs](https://babeljs.io/) transform is also configured to process JavaScript assets, including [reactjs](https://facebook.github.io/react/docs/getting-started.html) JSX.

And finally, we use [browser-pack](https://github.com/substack/browser-pack) to bundle up all the modules loaded by bit loader.

You can run this example from this directory with
```
node index.js > bundle.js
```

If you would like to run browserify to compare results, you can run this command
```
browserify --extension "jsx" -r "./js/Name.js" -t "babelify"
```
