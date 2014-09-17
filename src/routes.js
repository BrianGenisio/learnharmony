function* routes() {
  yield {page: 'home', route: '/'};
  yield {page: 'about'};
  yield {page: 'lessons/arrow-functions'};
  yield {page: 'lessons/destructuring'};
}

export default routes;