class StringCompiler {
  transpile(code) {
    let traceurCompiler = new traceur.Compiler({
      modules: 'commonjs',
      experimental: true
    });
    return traceurCompiler.compile(code);
  }
}

export default StringCompiler;