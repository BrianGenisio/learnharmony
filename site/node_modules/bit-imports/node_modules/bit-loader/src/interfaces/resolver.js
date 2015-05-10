function Resolver() {
}

Resolver.prototype.resolve = function(moduleMeta) {
  moduleMeta.configure({
    cname: moduleMeta.name
  });
};

module.exports = Resolver;
