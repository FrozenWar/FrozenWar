import React from 'react';

import GameView from './gameView.js';

export default class App extends React.Component {
  render() {
    return <GameView engine={this.props.engine} />;
  }
}
