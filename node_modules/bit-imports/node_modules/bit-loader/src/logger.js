(function() {
  "use strict";

  var _enabled = false;
  var _only    = false;
  var noop     = function noop() {};


  /**
   * @class
   * Logger instance with a name
   *
   * @param {string} name - Name of the logger
   */
  function Logger(name, options) {
    options = options || {};
    this.name     = name;
    this._enabled = true;
    this._target  = ensureTarget(options._target);
  }


  /**
   * Helper factory method to create named loggers
   */
  Logger.prototype.factory = function(name, options) {
    return new Logger(name, options);
  };


  /**
   * Method to log a message.
   *
   * Verifies that logger is enabled. If it is enabled, then the message(s) are
   * logged. Otherwise ignored.
   */
  Logger.prototype.log = function() {
    if (!this.isEnabled()) {
      return;
    }

    this._target.log.apply(this._target, [getDate(), this.name].concat(arguments));
  };


  /**
   * Method to log JSON.
   *
   * Verifies that the logger is enabled. If it is enabled, then the input JSON
   * is logged.  Otherwise ignored.
   */
  Logger.prototype.dir = function() {
    if (!this.isEnabled()) {
      return;
    }

    this._target.dir.apply(this._target, arguments);
  };


  /**
   * Method to log errors.
   *
   * Verifies that the logger is enabled. If it is enabled, then the error(s)
   * are logged.  Otherwise ignored.
   */
  Logger.prototype.error = function() {
    if (!this.isEnabled()) {
      return;
    }

    this._target.error.apply(this._target, arguments);
  };


  /**
   * Checks if the logger can write messages.
   *
   * @returns {boolean}
   */
  Logger.prototype.isEnabled = function() {
    return this._enabled && _enabled && (!_only || _only === this.name);
  };


  /**
   * Method to enable the logger intance. If loggers have been disabled
   * globally then this flag will not have an immediate effect, until
   * loggers are globally enabled.
   */
  Logger.prototype.enable = function() {
    this._enabled = true;
  };


  /**
   * Method to disable the logger instance. Like {@link Logger#enable},
   * this setting does not have an immediate effect if loggers are globally
   * disabled.
   */
  Logger.prototype.disable = function() {
    this._enabled = false;
  };


  /**
   * Method to make sure only this logger logs messages. If another logger is
   * set to only, then the request is silently ignored.
   */
  Logger.prototype.only = function() {
    if (!Logger._only) {
      Logger._only = this.name;
    }
  };


  /**
   * Method to remove the logger from the `only` state to allow other loggers
   * set themselves as only.
   */
  Logger.prototype.all = function() {
    Logger._only = null;
  };


  /**
   * Disables loggers globally.
   */
  Logger.prototype.disableAll = function() {
    Logger.disable();
  };


  /**
   * Enables loggers globally.
   */
  Logger.prototype.enableAll = function() {
    Logger.enable();
  };


  // Expose the constructor to be able to create new instances from an
  // existing instance.
  Logger.prototype.Logger = Logger;


  /**
   * Underlying method to enable all logger instances
   *
   * @private
   */
  Logger.enable  = function() {
    _enabled = true;
  };


  /**
   * Underlying method to disable all logger instances
   *
   * @private
   */
  Logger.disable = function() {
    _enabled = false;
  };


  /**
   * Underlying method to set the `only` logger instance that can log message
   *
   * @private
   */
  Logger.only = function(name) {
    _only = name;
  };


  /**
   * Underlying method to remove the `only` logger instance that can log
   * message
   *
   * @private
   */
  Logger.all = function() {
    _only = null;
  };


  /**
   * Returns a valid console interface with three methods:
   * - log, which logs raw text messages.
   * - error, which logs errors including exceptions.
   * - dir, which logs JSON
   *
   * @returns {{log: function, error: function, dir: function}}
   */
  function getConsole() {
    var _result;
    if (typeof(console) !== 'undefined') {
      _result = console;
    }
    else {
      _result = {log: noop, error: noop, dir: noop};
    }
    return _result;
  }


  /**
   * Method that fills in the target object to make sure we have a valid target
   * we are writing to.
   */
  function ensureTarget(target) {
    if (!target) {
      return getConsole();
    }

    target.log   = target.log   || noop;
    target.error = target.error || noop;
    target.dir   = target.dir   || noop;
    return target;
  }


  /**
   * Helper method to get timestamps for logged message
   *
   * @private
   */
  function getDate() {
    return (new Date()).getTime();
  }


  /**
   * Default logger instance available
   */
  module.exports = new Logger();
}());
