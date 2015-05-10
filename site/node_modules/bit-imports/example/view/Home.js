import Component  from "js/Component";
import Jumbotron  from "view/Jumbotron";
import Highlights from "view/Highlights";

var co = Component.cojones;


class Description extends Component {
  render() {
    return co `
      <div class="page-header">
        <h1>
          bit imports
          <small >module loader for the browser</small>
        </h1>
      </div>
    `;
  }
}


class Babel extends Component {
  render() {
    return co `
      <div class="media">
        <div class="media-body">
          <p>
            With the flexibility of bit imports' plugin system, adding <a href="https://babeljs.io/">babeljs</a> support <i>in the browser</i> is very trivial.
          </p>
          This means you can start using the newest ES features available, while transparently integrating with external dependencies and <i>legacy</i> code written in different module formats.
        </div>
        <div class="media-right">
          <a href="https://babeljs.io/">
            <img alt="babel" src="https://raw.githubusercontent.com/babel/logo/master/logo.png" width="200px">
          </a>
        </div>
      </div>
    `;
  }
}


class Home extends Component {
  constructor(options = {}) {
    super(options);
  }

  render() {
    var jumboContent = co `
      ${new Description()}
    `;

    var babelContent = co `
      ${new Babel()}
    `;

    return co `
      ${new Jumbotron({content: jumboContent})}
      ${new Highlights()}
      ${new Jumbotron({content: babelContent})}
    `;
  }
}


export default Home;
