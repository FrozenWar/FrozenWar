import PIXI from 'pixi.js';
import {DebugTile} from './tile.js';

function getRenderX(hexagon, x, y) {
  return x * hexagon.width + (hexagon.width / 2 * (y & 1));
}

function getRenderY(hexagon, x, y) {
  return y * (hexagon.height - hexagon.sideY - 2);
}

let renderer;
let stage = new PIXI.Container();
stage.interactive = true;

let container = new PIXI.Container();
stage.addChild(container);

let hexagon = DebugTile.hexagon;

// Get hexagon tile size by width/height..
function getHexWidth(width) {
  return Math.ceil((width - hexagon.sideX - 2) / hexagon.width);
}

function getHexHeight(height) {
  return Math.ceil((height - hexagon.sideY - 2) / (hexagon.height -
    hexagon.sideY - 2));
}

let width = getHexWidth(800 / 2);
let height = getHexHeight(600 / 2);

let mapWidth = hexagon.width * width + hexagon.sideX + 2;
let mapHeight = (hexagon.height - hexagon.sideY - 2) * height +
  hexagon.sideY + 2;

let mapBoundary = new PIXI.Graphics();
mapBoundary.lineStyle(2, 0xFF0000, 1);
mapBoundary.drawRect(0, 0, mapWidth, mapHeight);

mapBoundary.lineStyle(2, 0x00FF00, 1);
mapBoundary.drawRect(0, 0, 800 / 2, 600 / 2);

for (let y = 0; y < height; ++y) {
  for (let x = 0; x < width; ++x) {
    var tile = new PIXI.Sprite(DebugTile.texture);
    container.addChild(tile);
    tile.position.x = getRenderX(DebugTile.hexagon, x, y);
    tile.position.y = getRenderY(DebugTile.hexagon, x, y);
  }
}

container.addChild(mapBoundary);

export function render() {
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
