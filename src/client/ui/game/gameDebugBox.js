import React from 'react';

export default class GameDebugBox extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <div className='gameDebugView'>
      {JSON.stringify(this.props.engine.getState())}
    </div>;
  }
}
