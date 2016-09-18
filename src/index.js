import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, hashHistory } from 'react-router'

import 'bootstrap/dist/css/bootstrap.min.css';
import 'highlight.js/styles/default.css';
import 'codemirror/lib/codemirror.css';

import App from './components/app';
import content from './content';

const routes = [
  <Route path="/" key="/" component={App} />,
  ...content.map(page => {
    const route = `${page.route}`;
    return <Route path={route} key={route} component={App} />
  })
];

ReactDOM.render(
  <Router history={hashHistory}>
    {routes}
  </Router>,
  document.getElementById('root')
);
