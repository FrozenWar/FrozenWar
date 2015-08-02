import React from 'react';

import GameDebugBox from './gameDebugBox.js';
import ViewportBox from './viewportBox.js';

export default class GameView extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <div className='view game'>
      <GameDebugBox engine={this.props.engine} />
      <ViewportBox engine={this.props.engine} width={800} height={600} />
    </div>;
  }
}
