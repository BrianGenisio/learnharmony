var StringDecoder = require("string_decoder").StringDecoder;


function pstream(stream, options) {
  return pstream.toPromise(stream, options);
}


pstream.toPromise = function(stream, options) {
  options = options || {};
  options.encoding = options.encoding || "utf8";

  return new Promise(function(resolve, reject) {
    var decoder = new StringDecoder(options.encoding);
    var buffer  = "";

    stream.on("data", function onData(chunk) {
      if (chunk !== null) {
        buffer += decoder.write(chunk);
      }
    })
    .on("end", function onEnd() {
      resolve(buffer);
    })
    .on("error", function onError(error) {
      console.error(error);
      reject(error);
    });
  });
};


module.exports = pstream;
