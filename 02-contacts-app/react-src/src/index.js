
import React from 'react';
import ReactDom from 'react-dom/client';

import {init} from '@neutralinojs/lib';
import App from './App';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDom.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  init();
}
	