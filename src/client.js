// Client init point
/* import io from 'socket.io-client';
let socket = io();

socket.on('connect', () => {
  console.log('connected!');
}); */

// import indexHtml from './assets/test.html';
// document.body.innerHTML = indexHtml;

import buildEngine from './game/init.js';
let engine = buildEngine(false);

import {init as rendererInit} from './client/renderer/';

// React test code

import React from 'react';

let CanvasBox = React.createClass({
  render: function() {
    return (
      <canvas>
        Does not support canvas
      </canvas>
    );
  },
  shouldComponentUpdate: function() {
    return false;
  },
  componentDidMount: function() {
    this.props.onLoad(React.findDOMNode(this));
  }
});

let GameView = React.createClass({
  render: function() {
    return (
      <div>
        <p>{this.props.gameName}</p>
        <CanvasBox onLoad={this.props.onLoad}/>
      </div>
    );
  }
});

React.render(
  <GameView gameName="ReactTest" onLoad={rendererInit.bind(null, engine)} />,
  document.body
);
