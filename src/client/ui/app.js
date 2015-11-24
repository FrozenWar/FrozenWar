import React, { Component } from 'react';
import GameView from './game/gameView.js';

export default class App extends Component {
  render() {
    return <div className='app'>
      <GameView engine={this.props.engine} />
    </div>;
  }
}
