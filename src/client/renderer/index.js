import PIXI from 'pixi.js';
import Tile from './tile.js';
import Viewport from './viewport.js';

let renderer;
let stage = new PIXI.Container();
let container = new PIXI.Container();
stage.addChild(container);

let hexagon = Tile.hexagon;

let viewport;

function onDragMove(event) {
  let diffX = event.clientX - viewport.prevX;
  let diffY = event.clientY - viewport.prevY;
  viewport.prevX = event.clientX;
  viewport.prevY = event.clientY;
  viewport.moveCamera(-diffX, -diffY);
}

function onDragEnd() {
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('mouseup', onDragEnd);
}

function onDragStart(event) {
  viewport.prevX = event.clientX;
  viewport.prevY = event.clientY;
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup', onDragEnd);
}

function onMouseMove(event) {
  // translate code....
  let totalOffsetX = 0;
  let totalOffsetY = 0;
  let canvasX = 0;
  let canvasY = 0;
  let currentElement = this;
  do {
    totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
    totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    currentElement = currentElement.offsetParent;
  } while (currentElement);
  canvasX = event.pageX - totalOffsetX;
  canvasY = event.pageY - totalOffsetY;
  viewport.handleMouseMove(canvasX, canvasY);
}

export function render() {
  renderer.render(stage);
  requestAnimationFrame(render);
}

// TODO make them to separate class?
export function init(engine, view) {
  /*eslint-disable */
  renderer = new PIXI.autoDetectRenderer(800, 600, {
    view: view
  });
  /*eslint-enable */
  viewport = new Viewport(engine, renderer, hexagon, 800, 600);
  container.addChild(viewport.container);
  view.addEventListener('mousedown', onDragStart);
  view.addEventListener('mousemove', onMouseMove);
  render();
}
