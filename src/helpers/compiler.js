function compile(code) {
  return System.transform(code)
    .then(transpileSuccess, transpileError);


  function transpileSuccess(transpiled) {
    let result =
      `(function() {
      ${ transpiled }
      })();`;
    return result;
  }

  function transpileError(err) {
    console.log(err.message);
    return err;
  }
}

export {compile};