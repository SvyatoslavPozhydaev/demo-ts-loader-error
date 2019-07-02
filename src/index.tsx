import 'es6-shim';

import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import { Provider } from 'react-redux';

import { App } from 'App';

ReactDOM.render(
  <App />,
  document.getElementById('app'),
);
