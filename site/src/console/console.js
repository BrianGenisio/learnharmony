class Console {
  constructor() {
    this.hijackLog();
  }

  hijackLog() {
    if(console.log.hijacked) return;

    let oldLog = console.log;
    let self = this;

    console.log = function(...args) {
      if(self.$el) {
        var data = JSON.stringify.apply(this, args);
        self.$el.append(`<li>${data}</li>`);
      }

      oldLog.apply(console, args);
    };

    console.log.hijacked = true;
  }

  render($element) {
    $element.html('<ul></ul>');
    this.$el = $element.find('ul');
  }
}

export default Console;