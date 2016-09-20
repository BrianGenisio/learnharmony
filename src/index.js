import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, hashHistory } from 'react-router';
import {Provider} from 'react-redux';

// TODO: Get the Bitimports config loaded
//import './import.config.js';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'highlight.js/styles/default.css';
import 'codemirror/lib/codemirror.css';

import {hijackConsole} from './helpers/hijack-console';
import App from './components/app';
import content from './content';
import createStore from './redux/store';
import {changeRoute, consoleLog, consoleClear} from './redux/actions'

const store = createStore();

hijackConsole(
  line => store.dispatch(consoleLog(line)), 
  () => store.dispatch(consoleClear())
);

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
