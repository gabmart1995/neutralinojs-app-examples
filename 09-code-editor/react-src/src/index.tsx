
import React from 'react';
import ReactDom from 'react-dom/client';

import './style.css';

import {app, init, events} from '@neutralinojs/lib';
import App from './App';

init();

events.on('windowClose', () => {
  app.exit();
});

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDom.createRoot(rootElement);
  root.render(<React.StrictMode><App /></React.StrictMode>);
}
	