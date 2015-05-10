import Component from "js/Component";


class Header extends Component {
  constructor(options = {}) {
    super(options);
  }

  render() {
    return Component.cojones `
      <div class="navbar navbar-inverse navbar-fixed-top">
        <div class="container">
          <a class="navbar-brand"><img src="img/bit-imports_grey.png" class="logo"/></a>

          <ul class="nav navbar-nav">
            <li><a href="https://github.com/MiguelCastillo/bit-imports/tree/master/example" target="exmples">Example</a></li>
          </ul>

          <ul class="nav navbar-nav navbar-right">
            <li><a href="https://twitter.com/bitsjs" target="twitter" class="navbar-icon" title="twitter"><i class="fa fa-twitter"></i></a></li>
            <li><a href="https://github.com/MiguelCastillo/bit-imports" target="github" class="navbar-icon" title="github"><i class="fa fa-github"></i></a></li>
            <li><a href="https://gitter.im/MiguelCastillo/bit-imports" target="gitter" class="navbar-icon" title="gitter"><i class="fa fa-weixin"></i></a></li>
          </ul>
        </div>
      </div>
    `;
  }
}

export default Header;
