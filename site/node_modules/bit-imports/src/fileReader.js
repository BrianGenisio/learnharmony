var _streamProvider;
function register(provider) {
  _streamProvider = provider;
}

function fileReader(file) {
  return _streamProvider(file);
}

fileReader.register = register;
module.exports = fileReader;
