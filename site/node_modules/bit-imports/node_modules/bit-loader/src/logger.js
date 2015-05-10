var _enabled = false;
var _only    = false;


/**
 * @class
 * Logger instance with a name
 *
 * @param {string} name - Name of the logger
 */
function Logger(name, options) {
  options = options || {};
  this._enabled  = true;
  this.name      = name;

  configureStream(this, options);
  configureSerializer(this, options);
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

  var data = {date: getDate(), type: "log", name: this.name, data: arguments};
  (Logger.stream || this.stream).write((Logger.serialize || this.serialize)(data));
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

  var data = {date: getDate(), type: "error", name: this.name, data: arguments};
  (Logger.stream || this.stream).write((Logger.serialize || this.serialize)(data));
};


/**
 * Method to log warnings.
 *
 * Verifies that the logger is enabled. If it is enabled, then the warnings(s)
 * are logged.  Otherwise ignored.
 */
Logger.prototype.warn = function() {
  if (!this.isEnabled()) {
    return;
  }

  var data = {date: getDate(), type: "warn", name: this.name, data: arguments};
  (Logger.stream || this.stream).write((Logger.serialize || this.serialize)(data));
};


/**
 * Method to log informational message.
 *
 * Verifies that the logger is enabled. If it is enabled, then the info(s)
 * are logged.  Otherwise ignored.
 */
Logger.prototype.info = function() {
  if (!this.isEnabled()) {
    return;
  }

  var data = {date: getDate(), type: "info", name: this.name, data: arguments};
  (Logger.stream || this.stream).write((Logger.serialize || this.serialize)(data));
};


/**
 * Method to be overiden to give custom behavior.
 */
Logger.prototype.serialize = function(data) {
  return data;
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
Logger.prototype.default = Logger;


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
 *
 * @returns {{write: function}}
 */
function getConsoleStream() {
  var result;
  if (typeof(console) !== "undefined") {
    result = console;
  }

  return result && {
    write: function(data) {
      result.log(data);
    }
  };
}


/**
 * Gets defaul process.stdout when running in node.
 */
function getProcessStream() {
  var result;
  if (typeof(process) !== "undefined" && process.stdout) {
    result = process.stdout;
  }

  return result && {
    write: function(data) {
      result.write(data);
    }
  };
}


/**
 * Get a noop stream
 */
function getNoopStream() {
  return {
    write: function() {}
  };
}


/**
 * Method that fills in the target object to make sure we have a valid target
 * we are writing to.
 */
function configureStream(logger, options) {
  logger.stream = options.stream || getConsoleStream() || getProcessStream() || getNoopStream();
}


/**
 * Handler custom serializers
 */
function configureSerializer(logger, options) {
  if (options.serialize) {
    logger.serialize = options.serialize;
  }
  else if (typeof(process) !== "undefined" && process.stdout) {
    logger.serialize = function(data) {
      if (typeof(data) !== "string") {
        data = JSON.stringify(data);
      }
      return data;
    };
  }
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
