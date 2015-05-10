/**
 * Convert module name to full module path
 */
function resolvePath(moduleMeta) {
  moduleMeta.configure({
    path: __dirname + "/" + moduleMeta.name
  });
}

module.exports = resolvePath;
