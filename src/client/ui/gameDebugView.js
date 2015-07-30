import React from 'react';

export default class GameDebugView extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let entityList = this.props.engine.getEntities().map((entity) => {
      return <li key={entity.id}>
        {JSON.stringify(entity.toJSON())}
      </li>;
    });
    return <div className='gameDebugView'>
      <ul>
        {entityList}
      </ul>
    </div>;
  }
}
