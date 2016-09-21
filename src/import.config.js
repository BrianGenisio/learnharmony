import bitimports from 'bit-imports/browser';
import babel from 'babel-bits';

var System = (function() {
  var importer = bitimports.config({
    plugins: [{
      transform: babel
    }]
  });

  return importer;
})();

global.System = System;
export default System;
