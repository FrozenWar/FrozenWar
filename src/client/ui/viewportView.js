import React from 'react';
import PIXI from 'pixi.js';
import Tile from '../renderer/tile.js';
import Viewport from '../renderer/viewport.js';
import {calcOffset} from '../utils/utils.js';

import CanvasView from './canvasView.js';

let TOLERANCE = 6;
let hexagon = Tile.hexagon;

export default class ViewportView extends React.Component {
  constructor(props) {
    super(props);
    this.stage = new PIXI.Container();
  }
  initRender(view) {
    /*eslint-disable */
    this.renderer = new PIXI.autoDetectRenderer(this.props.width,
      this.props.height, {
      view: view
    });
    /*eslint-enable */
    this.viewport = new Viewport(this.props.engine, this.renderer, hexagon,
      this.props.width, this.props.height);
    this.stage.addChild(this.viewport.container);
    this.animate();
    // TODO Horrible function chunk. it needs to be fixed.
    let viewport = this.viewport;
    function onDragMove(event) {
      let diffX = event.clientX - viewport.prevX;
      let diffY = event.clientY - viewport.prevY;
      viewport.prevX = event.clientX;
      viewport.prevY = event.clientY;
      viewport.moveCamera(-diffX, -diffY);
    }
    function onDragEnd(event) {
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
      let diff = Math.abs(event.clientX - viewport.startX) +
        Math.abs(event.clientY - viewport.startY);
      if (diff < TOLERANCE) {
        let offset = calcOffset(view);
        let canvasX = 0;
        let canvasY = 0;
        canvasX = event.pageX - offset.x;
        canvasY = event.pageY - offset.y;
        viewport.handleMouseClick(canvasX, canvasY);
      }
    }
    function onDragStart(event) {
      viewport.prevX = event.clientX;
      viewport.prevY = event.clientY;
      viewport.startX = event.clientX;
      viewport.startY = event.clientY;
      document.addEventListener('mousemove', onDragMove);
      document.addEventListener('mouseup', onDragEnd);
    }
    function onMouseMove(event) {
      let offset = calcOffset(this);
      let canvasX = 0;
      let canvasY = 0;
      canvasX = event.pageX - offset.x;
      canvasY = event.pageY - offset.y;
      viewport.handleMouseMove(canvasX, canvasY);
    }
    view.addEventListener('mousedown', onDragStart);
    view.addEventListener('mousemove', onMouseMove);
  }
  animate() {
    if (this.viewport.shouldComponentUpdate()) {
      this.renderer.render(this.stage);
      this.viewport.update();
    }
    requestAnimationFrame(this.animate.bind(this));
  }
  render() {
    return <CanvasView onLoad={this.initRender.bind(this)}/>;
  }
}
