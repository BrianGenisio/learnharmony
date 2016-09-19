import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, hashHistory } from 'react-router';
import {Provider} from 'react-redux';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'highlight.js/styles/default.css';
import 'codemirror/lib/codemirror.css';

import App from './components/app';
import content from './content';
import createStore from './redux/store';
import {changeRoute} from './redux/actions'

const store = createStore();

function onRouteChange(route) {
  store.dispatch(changeRoute(route));
}

const routes = [
  <Route path="/" key="/" component={App} onEnter={() => onRouteChange('/')} />,
  ...content.map(page => {
    const route = `${page.route}`;
    return <Route path={route} key={route} component={App} onEnter={() => onRouteChange(route)} />
  })
];

ReactDOM.render(
  <Provider store={store}>
    <Router history={hashHistory}>
      {routes}
    </Router>
  </Provider>,
  document.getElementById('root')
);
