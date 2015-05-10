var fileReader  = require("./fileReader");
var resolvePath = require("./resolvePath");
var Task        = require("./task");
var Bitloader   = require("bit-loader");
var Utils     = Bitloader.Utils;


/**
 * @class
 *
 * Interface for registering and running tasks
 */
function TaskRunner(options) {
  this._tasks  = {};
  this.options = options || {};
}


/**
 * Method to create new task runner with the particular settings.
 *
 * @returns {TaskRunner} New task runner instance
 */
TaskRunner.prototype.configure = function(options) {
  return new TaskRunner(options);
};


/**
 * Method to register a task
 *
 * @returns {TaskRunner} Task runner instance
 */
TaskRunner.prototype.register = function(name, deps, cb) {
  if (!Utils.isString(name)) {
    throw new TypeError("Must provide a name for the task");
  }

  if (Utils.isFunction(deps)) {
    cb = deps;
    deps = [];
  }

  this._tasks[name] = new Task(this, {
    name: name,
    deps: deps,
    cb: cb,
    resolve: resolvePath.configure({baseUrl: (this.options.baseUrl)}),
    fetch: fileReader
  });

  return this;
};


/**
 * Method to run a task
 *
 * @param {string} name - Name of the task to run
 *
 * @returns {TaskRunner} Task runner instance
 */
TaskRunner.prototype.syncRun = TaskRunner.prototype.run = function() {
  this.asyncRun.apply(this, arguments);
  return this;
};


/**
 * Method to run a task and returns a promise
 *
 * @param {string} name - Name of the task to run
 *
 * @returns {Promise} Promise from the task, which resolves when the task is
 *  finished executing and rejects if the task failed to run.
 */
TaskRunner.prototype.asyncRun = function(name) {
  var task = this._tasks[name];

  if (!task) {
    throw new TypeError("Task '" + name + "' not found");
  }

  return task
    .init(Array.prototype.slice.call(arguments, 1))
    .run();
};


module.exports = new TaskRunner();
