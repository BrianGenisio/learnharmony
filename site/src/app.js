import StringCompiler from 'src/editor/string-compiler';

class App {
  constructor(message) {
    this.message = message;
  }

  greet() {
    let element = document.querySelector('#message');
    element.innerHTML = this.message;
  }
};

let app = new App('Hello, world!');
app.greet();

let compiler = new StringCompiler();
var transpiled = compiler.transpile('let foo = x => x * x; console.log(foo(5));');

console.log('running', transpiled);
eval(transpiled);