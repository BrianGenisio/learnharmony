import Component from "js/Component";
import Jumbotron  from "view/Jumbotron";


class Highlights extends Component {
  render() {
    var content = Component.cojones `
      <div class="container">
        <div class="row">
          <div class="col-md-4">
            <h1 class="text-center"><i class="fa fa-files-o"></i></h1>
            <h3 class="text-center">Formats</h3>
            <div class="text-muted">Building applications generally means dependencies of incompatible module formats. For this, bit imports supports AMD and CJS out of the box.</div>
          </div>
          <div class="col-md-4">
            <h1 class="text-center"><i class="fa fa-plug"></i></h1>
            <h3 class="text-center">Pluggable</h3>
            <div class="text-muted">Simple and flexible plugin system for building pipelines to process your assets.</div>
          </div>
          <div class="col-md-4">
            <h1 class="text-center"><i class="fa fa-list-alt"></i></h1>
            <h3 class="text-center">Browser</h3>
            <div class="text-muted">Remove your bundling step when developing your Application. Only bundle when you really need to - before deploying to production.</div>
          </div>
        </div>
      </div>
    `;

    return Component.cojones `
      ${new Jumbotron({content: content})}
    `;
  }
}


export default Highlights;
