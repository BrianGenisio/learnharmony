class Console {
  constructor() {
    this.hijackLog();
    this.started = false;
  }

  hijackLog() {
    if(console.log.hijacked) return;

    let oldLog = console.log;

    console.log = (...args) => {
      oldLog.apply(console, args);
      this.logToScreen(args);
    };

    console.log.hijacked = true;
  }

  stringify(obj) {
    return JSON.pruned(obj);
  }

  logToScreen(args) {
    if(!this.$el) return;

    if(!this.started) {
      this.$el.text('');
      this.started = true;
    }

    let line = args.map(arg => !arg ? 'undefined' : this.stringify(arg) || arg.toString()).join(' ');
    this.$el.append(`console > ${line} \n`);
  }

  render($element) {
    $element.html('<pre>console &gt; \n</pre>');
    this.$el = $element.find('pre');
  }
}

export default Console;