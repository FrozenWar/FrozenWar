// Client init point
/* import io from 'socket.io-client';
let socket = io();

socket.on('connect', () => {
  console.log('connected!');
}); */

// import indexHtml from './assets/test.html';
// document.body.innerHTML = indexHtml;

import React from 'react';
import { render } from 'react-dom';
import App from './client/ui/app.js';

import configureStore from './game/store.js';
import { spawn, spawnTemplate } from './game/actions/spawn.js';

let store = configureStore(true);
store.dispatch(spawn({
  player: {
    name: 'test'
  }
}));
store.dispatch(spawnTemplate('TestEntity', {
  pos: {
    x: 4, y: 4
  }
}));
// Expose engine to global scope
window.engine = store;

render(
  <App engine={store} />,
  document.body
);
