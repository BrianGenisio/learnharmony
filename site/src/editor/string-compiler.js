class StringCompiler {
  transpile(code, moduleName) {
    let traceurCompiler = new traceur.Compiler({
      moduleName: moduleName,
      experimental: true
    });
    
    let transpiled = traceurCompiler.compile(code);

    let result = 
`(function() { 

${ transpiled } 

})();`;

    return result;
  }
}

export default StringCompiler;