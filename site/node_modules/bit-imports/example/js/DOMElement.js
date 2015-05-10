import "js/DOMEvents";

class DOMElement {
  constructor(options = {}) {
    if (DOMElement.isElement(options)) {
      options = {
        el: options
      };
    }

    var settings = {};
    this.options = settings;
    this._el = options.el || DOMElement.create("div");
    this._events = {};

    for (var option in options) {
      if (!options.hasOwnProperty(option)) {
        continue;
      }

      if (typeof(this[option]) === "function") {
        this[option](options[option]);
      }
      else {
        settings[option] = options[option];
      }
    }
  }


  on(evts) {
    var fn, evtName, handlers;

    // Handle passing in an event name and function handler as arguments instead
    // of an object literal
    if (typeof(evts) === "string") {
      evtName = arguments[0];
      fn = arguments[1];

      evts = {
        [evtName]: fn
      };
    }

    for (var evt in evts) {
      evtName = evt;
      fn = evts[evtName];

      if (!this._events[evtName]) {
        this._events[evtName] = [];
      }

      handlers = this._events[evtName];
      if (!(~handlers.indexOf(fn))) {
        handlers.push(fn);
        this._el.addEventListener(evtName, fn);
      }
    }

    return this;
  }


  off(evts) {
    var fn, evtName, handlers;

    // Handle passing in an event name and function handler as arguments instead
    // of an object literal
    if (typeof(evts) === "string") {
      evtName = arguments[0];
      fn = arguments[1];

      evts = {
        [evtName]: fn
      };
    }

    for (var evt in evts) {
      evtName = evt;

      handlers = this._events[evtName];
      if (handlers && ~handlers.indexOf(fn)) {
        handlers.splice(handlers.indexOf(fn), 1);
        this._el.removeEventListener(evtName, fn);
      }
    }

    return this;
  }


  html(content) {
    this._el.innerHTML = content;
    return this;
  }


  parent() {
    return this._el.parent;
  }


  append(els) {
    if (!(els instanceof Array)) {
      els = [els];
    }

    var el, i, length;
    for (i = 0, length = els.length; i < length; i++) {
      el = els[i];

      if (typeof(el) === "string") {
        el = new DOMElement({html:el});
      }

      if (el instanceof DOMElement || DOMElement.isElement(el._el)) {
        this._el.appendChild(el._el);
      }
      else if (DOMElement.isElement(el)) {
        this._el.appendChild(el);
      }
    }

    return this;
  }


  remove(el) {
    if (el instanceof DOMElement) {
      el = el._el;
    }

    this._el.removeChild(el);
    return this;
  }


  attrs(attrs) {
    for (var attr in attrs) {
      this._el.setAttribute(attr, attrs[attr]);
    }

    return this;
  }


  static create(tagName) {
    return document.createElement(tagName);
  }


  static isElement(el) {
    return el && el.nodeType &&
        (el.nodeType === 1 || el.nodeType === 11);
  }
}

export default DOMElement;
