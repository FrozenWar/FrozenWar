import PIXI from 'pixi.js';
import {DebugTile} from './tile.js';
import Viewport from './viewport.js';

let renderer;
let stage = new PIXI.Container();
stage.interactive = true;

let container = new PIXI.Container();
stage.addChild(container);

let hexagon = DebugTile.hexagon;

let viewport;

function onDragStart(event) {
  this.data = event.data;
  this.prevX = this.data.global.x;
  this.prevY = this.data.global.y;
  this.dragging = true;
}

function onDragEnd() {
  this.dragging = false;
  this.data = null;
}

function onDragMove(event) {
  viewport.handleClick(event.data.global.x, event.data.global.y);
  if (!this.dragging) return;
  let diffX = this.data.global.x - this.prevX;
  let diffY = this.data.global.y - this.prevY;
  this.prevX = this.data.global.x;
  this.prevY = this.data.global.y;
  viewport.moveCamera(-diffX, -diffY);
}

export function render() {
  renderer.render(stage);
  requestAnimationFrame(render);
}

// TODO make them to separate class?
export function init(engine, view) {
  stage
    // events for drag start
    .on('mousedown', onDragStart)
    .on('touchstart', onDragStart)
    // events for drag end
    .on('mouseup', onDragEnd)
    .on('mouseupoutside', onDragEnd)
    .on('touchend', onDragEnd)
    .on('touchendoutside', onDragEnd)
    // events for drag move
    .on('mousemove', onDragMove)
    .on('touchmove', onDragMove);
  /*eslint-disable */
  renderer = new PIXI.autoDetectRenderer(800, 600, {
    view: view
  });
  /*eslint-enable */
  viewport = new Viewport(engine, renderer, hexagon, 800, 600);
  container.addChild(viewport.container);
  render();
}
