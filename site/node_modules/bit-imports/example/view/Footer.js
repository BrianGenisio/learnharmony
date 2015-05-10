import Component from "js/Component";


class Footer extends Component {
  constructor(options = {}) {
    super(options);
  }

  render() {
    return Component.cojones `
      <small class="footer navbar-inverse">© Miguel Castillo 2015</small>
    `;
  }
}

export default Footer;
