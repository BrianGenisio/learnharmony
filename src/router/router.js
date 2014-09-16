class Router {
  constructor() {
    this.routes = {};
  }

  route (path, handler) {  
    this.routes[path] = handler;
  }

  handleRouteChange() {
    var url = location.hash.slice(1) || '/';
    var handler = this.routes[url];

    if(handler) handler();
  }

  listen() {
    window.addEventListener('hashchange', () => this.handleRouteChange());  
    window.addEventListener('load', () => this.handleRouteChange());
  }
}

export default Router;