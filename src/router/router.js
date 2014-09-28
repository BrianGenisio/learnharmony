class Router {
  constructor() {
    this.routes = {};
  }

  route (path, handler) {  
    this.routes[path] = handler;
  }

  handleRouteChange() {
    var url = location.hash.slice(1) || '/';
    url = url[0] === '!' ? url.slice(1) : url;
    url = url.split('#')[0];

    var handler = this.routes[url] || this.routes['/' + url];

    if(handler) handler(url);
  }

  listen() {
    window.addEventListener('hashchange', () => this.handleRouteChange());  
    window.addEventListener('load', () => this.handleRouteChange());
    this.handleRouteChange();
  }
}

export default Router;