import PIXI from 'pixi.js';

window.onload = () => {
  /*eslint-disable */
  var renderer = new PIXI.autoDetectRenderer(800, 600);
  /*eslint-enable */
  document.body.appendChild(renderer.view);
};
