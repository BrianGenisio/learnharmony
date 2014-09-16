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
        var line = args.map(arg => JSON.stringify(arg) || arg.toString()).join(' ');
        self.$el.append(`> ${line} \n`);
      }

      oldLog.apply(console, args);
    };

    console.log.hijacked = true;
  }

  render($element) {
    $element.html('<pre></pre>');
    this.$el = $element.find('pre');
  }
}

export default Console;