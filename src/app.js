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