// Import main style
import "!style/application.scss";

// Import JavaScript
import $el        from "js/DOMElement";
import Component  from "js/Component";
import Ready      from "js/DOMReady";
import Renderer   from "js/DOMRenderer";
import Header     from "view/Header";
import Footer     from "view/Footer";
import Home       from "view/Home";


class AppMain extends Component {
  constructor(options = {}) {
    super(options);
  }

  render() {
    return Component.cojones `
      ${new Header()}
      ${new Home()}
      ${new Footer()}
    `;
  }

  ready(fn) {
    Ready(() => {
      fn(this);
    });
  }
}


(new AppMain()).ready(function(app) {
  // Render the application
  Renderer.render(new $el(document.body), app);
});
