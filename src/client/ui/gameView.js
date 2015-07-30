import React from 'react';
import ViewportView from './viewportView.js';

export default class GameView extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    // Currently only viewport belongs here
    return <div className='gameView'>
      <ViewportView engine={this.props.engine} width={800} height={600} />
    </div>;
  }
}
