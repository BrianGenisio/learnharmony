var Task      = require('./task');
var Bitloader = require('bit-loader');
var Utils     = Bitloader.Utils;


/**
 * @class
 *
 * Interface for registering and running tasks
 */
function TaskRunner() {
  this._tasks  = {};

  // Bind so that we do not lose the context
  this.register = register.bind(this);
  this.run      = syncRun.bind(this);
  this.deferred = asyncRun.bind(this);
}


/** Convenieve promise provider */
TaskRunner.prototype.Promise = Bitloader.Promise;

/** Convenience utilities */
TaskRunner.prototype.util = Utils;

/** Method to register a task */
TaskRunner.prototype.register = function() {};


/**
 * Method to run a task
 *
 * @param {string} name - Name of the task to run
 *
 * @returns {TaskRunner}
 */
TaskRunner.prototype.run = function() {};


/**
 * Method to run a task and returns a promise
 *
 * @param {string} name - Name of the task to run
 *
 * @returns {Promise}
 */
TaskRunner.prototype.deferred = function() {};


/** @private */
function register(name, deps, cb) {
  if (!Utils.isString(name)) {
    throw new TypeError("Must provide a name for the task");
  }

  if (Utils.isFunction(deps)) {
    cb = deps;
    deps = [];
  }

  this._tasks[name] = new Task(this, name, deps, cb);
  return this;
}


/** @private */
function syncRun() {
  this.deferred.apply(this, arguments);
  return this;
}


/** @private */
function asyncRun(name) {
  var task = this._tasks[name];

  if (!task) {
    throw new TypeError("Task '" + name + "' not found");
  }

  return task
    .init(Array.prototype.slice.call(arguments, 1))
    .run();
}


module.exports = new TaskRunner();
