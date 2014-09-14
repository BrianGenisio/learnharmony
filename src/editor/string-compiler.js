class StringCompiler {
  transpile(code) {
    let traceurCompiler = new traceur.Compiler({
      modules: 'commonjs',
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