(function() {
  "use strict";

  var URL = require('./url');

  function File(fileUrl, baseUrl) {
    this.url = new URL(fileUrl, baseUrl);
  }

  /**
   * Build and file object with the important pieces
   */
  File.parseParts = function (fileString) {
    var name;
    var directory = fileString.replace(/([^/]+)$/gmi, function(match) {name = match;return "";});

    return {
      name: name || "",
      directory: directory,
      path: fileString
    };
  };

  /**
   * Method to add an extension if one does not exist in the fileString.  It does NOT replace
   * the file extension if one already exists in `fileString`.
   *
   * @param {string} fileString - File string to add the extension to if one does not exist
   * @param {string} extension - Extension to add if one does not exist in `fileString`. The
   *   value is the extension without the `.`. E.g. `js`, `html`.  Not `.js`, `.html`.
   * @returns {string} New fileString with the new extension if one did not exist
   */
  File.addExtension = function(fileString, extension) {
    var fileName  = File.parseParts(fileString),
        fileParts = fileName.name.split(".");

    if (fileParts.length === 1 && extension) {
      fileParts.push(extension);
    }

    return fileName.directory + fileParts.join(".");
  };

  /**
   * Method to replace an extension, if one does not exist in the file string, it will be added.
   *
   * @param {string} fileString - File string to add the extension to if one does not exist
   * @param {string} extension - Extension to be either added to `fileString` or to replace the extension in `fileString`. The
   *   value is the extension without the `.`. E.g. `js`, `html`.  Not `.js`, `.html`.
   * @returns {string} fileString with the new extension
   */
  File.replaceExtension = function(fileString, extension) {
    var regex = /([^.\/\\]+\.)[^.]+$/;
    if (fileString.match(regex)) {
      return fileString.replace(regex, "$1" + extension);
    }
    else {
      return fileString + "." + extension;
    }
  };

  module.exports = File;
})();
