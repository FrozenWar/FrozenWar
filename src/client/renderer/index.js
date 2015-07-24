import PIXI from 'pixi.js';
import {DebugTile} from './tile.js';

function getRenderX(hexagon, x, y) {
  return x * hexagon.width + (hexagon.width / 2 * (y & 1));
}

function getRenderY(hexagon, x, y) {
  return y * (hexagon.height - hexagon.sideY - 2);
}

let renderer;
let stage = new PIXI.Graphics();
stage.interactive = true;

let container = new PIXI.Container();
stage.addChild(container);

for (let y = 0; y < 10; ++y) {
  for (let x = 0; x < 10; ++x) {
    var tile = new PIXI.Sprite(DebugTile.texture);
    container.addChild(tile);
    tile.position.x = getRenderX(DebugTile.hexagon, x, y);
    tile.position.y = getRenderY(DebugTile.hexagon, x, y);
  }
}

export function render() {
  container.x -= 2;
  container.y -= 2;
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
