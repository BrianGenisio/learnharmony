import bitimports from 'bit-imports/browser';
import babel from 'babel-bits';

var System = bitimports.config({
  plugins: [{
    transform: babel
  }]
});

global.System = System;
export default System;
