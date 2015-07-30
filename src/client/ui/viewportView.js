import React from 'react';
import PIXI from 'pixi.js';
import Tile from '../renderer/tile.js';
import Viewport from '../renderer/viewport.js';

import CanvasView from './canvasView.js';

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
    view.addEventListener('mousedown', onDragStart);
    view.addEventListener('mousemove', onMouseMove);
  }
  animate() {
    this.renderer.render(this.stage);
    requestAnimationFrame(this.animate.bind(this));
  }
  render() {
    return <CanvasView onLoad={this.initRender.bind(this)}/>;
  }
}
