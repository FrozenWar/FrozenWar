// Client init point
/* import io from 'socket.io-client';
let socket = io();

socket.on('connect', () => {
  console.log('connected!');
}); */

// import indexHtml from './assets/test.html';
// document.body.innerHTML = indexHtml;


import React from 'react';
import App from './client/ui/app.js';

React.render(
  <App />,
  document.body
);
