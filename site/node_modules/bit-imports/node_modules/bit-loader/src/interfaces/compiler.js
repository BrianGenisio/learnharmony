function Compiler() {
}

Compiler.prototype.compile = function(moduleMeta) {
  moduleMeta.configure({
    code: moduleMeta.source
  });
};

module.exports = Compiler;
