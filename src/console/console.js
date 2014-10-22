import {consoleTemplate} from './console.template';

class Console {
  constructor() {
    this.hijackConsole();
  }

  hijack(obj, funcName, action) {

    if(obj[funcName] && obj[funcName].hijacked) return;

    let oldFunc = obj[funcName] || function() {};

    obj[funcName] = (...args) => {
      oldFunc.apply(obj, args);
      action(args);
    };

    obj[funcName].hijacked = true;
  }

  hijackConsole() {
    this.hijack(console, 'log', args => this.logToScreen(args));
    this.hijack(console, 'clear', () => this.clear());
  }

  stringify(obj) {
    return JSON.pruned(obj);
  }

  prefix(line) {
    return `console > ${line} \n`;
  }

  clear() {
    if(!this.$log) return;

    this.$log.text(this.prefix(''));
    this.started = false;
  }

  escape(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  logToScreen(args) {
    if(!this.$log) return;

    if(!this.started) {
      this.$log.text('');
      this.started = true;
    }

    let line = args.map(arg => !arg ? 'undefined' : this.stringify(arg) || arg.toString()).join(' ');
    this.$log.append(this.prefix(this.escape(line)));
  }

  render($element) {
    $element.html(consoleTemplate);
    $element.find('#clear').click(() => this.clear());
    this.$log = $element.find('pre');
    this.clear();
  }
}

export default Console;