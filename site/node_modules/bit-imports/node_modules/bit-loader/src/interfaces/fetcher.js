function Fetcher() {
}

Fetcher.prototype.fetch = function(/*moduleMeta*/) {
  throw new TypeError("Fetcher:fetch is not implemented, must be implemented by the consumer code");
};

module.exports = Fetcher;
