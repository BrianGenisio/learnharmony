define(['js/cjs-simple-module'], function(cjsSimple) {
  function getName() {
    return 'AMD module';
  }

  return {
    getName: getName,
    cjsSimple: cjsSimple
  };
});
