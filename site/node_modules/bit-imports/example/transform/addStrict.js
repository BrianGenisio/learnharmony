// Add strict to the module before it is executed.
function addStrict(moduleMeta) {
  console.log("transform '" + moduleMeta.name + "'");
  moduleMeta.source = "'use strict;'\n" + moduleMeta.source;
}

module.exports = addStrict;
