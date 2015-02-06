class StringCompiler {
  transpile(code, moduleName) {
    return callImporterCompiler(code, moduleName);
//    return callTraceurCompiler(code, moduleName);
  }
}


function callImporterCompiler(code) {
    return System.transform(code)
      .then(function transpileSuccess(transpiled) {
        let result =
          `(function() {
          ${ transpiled }
          })();`;
        return result;
      }, function transpileError(err) {
        console.log(err.message);
        return err;
      });
}


function callTraceurCompiler(code, moduleName) {
    let traceurCompiler = new traceur.Compiler({
      moduleName: moduleName,
      experimental: true,
      freeVariableChecker: true
    });

    let transpiled = traceurCompiler.compile(code);

    let result =
      `(function() {
      ${ transpiled }
      })();`;

    return result;
}

export default StringCompiler;
