import React from 'react';

import GameDebugView from './gameDebugView.js';
import ViewportView from './viewportView.js';

export default class GameView extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <div className='gameView'>
      <GameDebugView engine={this.props.engine} />
      <ViewportView engine={this.props.engine} width={800} height={600} />
    </div>;
  }
}
