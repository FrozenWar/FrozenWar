import PIXI from 'pixi.js';
import {DebugTile} from './tile.js';
import Viewport from './viewport.js';

let renderer;
let stage = new PIXI.Container();
stage.interactive = true;

let container = new PIXI.Container();
stage.addChild(container);

let hexagon = DebugTile.hexagon;

let viewport = new Viewport(null, hexagon, 800, 600);
container.addChild(viewport.container);

export function render() {
  viewport.moveCamera(1, 1);
  renderer.render(stage);
  requestAnimationFrame(render);
}

export function init() {
  /*eslint-disable */
  renderer = new PIXI.autoDetectRenderer(800, 600);
  /*eslint-enable */
  document.body.appendChild(renderer.view);
  render();
}
