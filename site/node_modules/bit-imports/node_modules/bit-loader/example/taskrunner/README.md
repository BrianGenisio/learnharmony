## taskrunner

The takrunner example illustrates how to create tasks for processing files. These tasks can also have dependencies on other tasks, and run asynchronously.

taskrunner uses the same core components as the bundler example for configuring path resolvers used for reading files from storage. The important one to note is resolvePath.js, which uses [browser-resolve](https://github.com/defunctzombie/node-browser-resolve).

You can run the taskrunner with

```
node index.js
```
