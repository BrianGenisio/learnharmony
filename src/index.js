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

const store = createStore();

const routes = [
  <Route path="/" key="/" component={App} />,
  ...content.map(page => {
    const route = `${page.route}`;
    return <Route path={route} key={route} component={App} />
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
