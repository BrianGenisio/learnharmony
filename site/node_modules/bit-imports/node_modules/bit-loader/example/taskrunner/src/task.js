var Bitloader  = require("bit-loader");
var Utils      = Bitloader.Utils;
var Promise    = Bitloader.Promise;


/**
 * @class
 *
 * Task that can be executed by the task runner
 */
function Task(taskrunner, options) {
  var task  = this;
  var src, loader;
  var name = options.name;
  var deps = options.deps;
  var cb   = options.cb;

  function init(args) {
    if (loader) {
      loader.clear();
    }

    loader = new Bitloader({
      resolve: options.resolve,
      fetch: options.fetch
    });

    src = [];

    if (typeof(cb) === "function") {
      cb.apply(task, args);
    }

    return task;
  }

  function run() {
    if (deps.length) {
      var sequence = deps.reduce(function(runner, name) {
          return runner.then(runDeferred(name), Utils.reportError);
        }, Promise.resolve());

      return sequence.then(function() {
          if (src.length) {
            return loader.import(src);
          }
        }, Utils.reportError);
    }
    else if (src.length) {
      return loader.import(src);
    }
  }

  function load() {
    src = src.concat.apply(src, arguments);
    return task;
  }

  function then(cb) {
    loader.pipelines.transform.use(cb);
    return task;
  }

  function runDeferred(name) {
    return function() {
      return taskrunner.asyncRun(name);
    };
  }

  this.name = name;
  this.init = init.bind(this);
  this.run  = run.bind(this);
  this.load = load.bind(this);
  this.then = then.bind(this);
}


module.exports = Task;
