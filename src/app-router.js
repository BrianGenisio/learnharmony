import Router from './router/router';

class AppRoutes {
  constructor(routes) {
    this.routes = routes;
    this.router = new Router();
  }

  start(mapPage) {
    for(let {page, route} of this.routes) {
      route = route || page;
      this.router.route(route, url => mapPage(page, url));
    }

    this.router.listen();
  }
}

export default AppRoutes;