class Component {
  constructor(options = {}) {
    this.options = options;
  }

  render() {
    throw new TypeError("Must be implemented");
  }

  static cojones(items, ...params) {
    var result = items[0];
    var i, length;

    for (i = 0, length = params.length; i < length; i++) {
      result += processPart(params[i]) + items[i + 1];
    }

    return result;
  }
}


function processPart(part) {
  if (part && (part instanceof Component || part && typeof(part.render) === "function")) {
    return part.render();
  }
  else if (typeof(part) === "string") {
    return part;
  }
}


export default Component;
