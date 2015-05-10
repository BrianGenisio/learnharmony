class DOMRenderer {
  constructor() {
  }


  render(container, items) {
    // Naive render. It would be nice to be able to remove/add only what's necessary.
    var html = DOMRenderer.__toString(items);
    container.html(html);
  }


  static __toString(items) {
    if (!(items instanceof Array)) {
      items = [items];
    }

    var i, length, item, result = "";
    for (i = 0, length = items.length; i < length; i++) {
      item    = items[i];
      result += item.render && item.render() || "";
    }

    return result;
  }
}


export default new DOMRenderer();
