import Component from "js/Component";


class Jumbotron extends Component {
  render() {
    return Component.cojones `
      <div class="jumbotron">
        <div class="container">${this.options.content}</div>
      </div>
    `;
  }
}

export default Jumbotron;
