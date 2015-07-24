// Client init point
/* import io from 'socket.io-client';
let socket = io();

socket.on('connect', () => {
  console.log('connected!');
}); */

import indexHtml from './assets/test.html';
document.body.innerHTML = indexHtml;

import buildEngine from './game/init.js';
console.log(buildEngine(false));

import {init as rendererInit} from './client/renderer/';
document.addEventListener('load', rendererInit);
