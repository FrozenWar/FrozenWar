// Client init point
/* import io from 'socket.io-client';
let socket = io();

socket.on('connect', () => {
  console.log('connected!');
}); */

// import indexHtml from './assets/test.html';
// document.body.innerHTML = indexHtml;

import buildEngine from './game/init.js';
let engine = buildEngine(true);
engine.e()
  .c('player', {
    name: 'test'
  });
engine.aa('spawn', null, null, {
  type: 'TestEntity',
  x: 4,
  y: 4,
  player: 0
});

import React from 'react';
import App from './client/ui/app.js';

React.render(
  <App engine={engine} />,
  document.body
);
