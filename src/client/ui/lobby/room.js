import React from 'react';

export default class Room extends React.Component {
  render() {
    // Just display room name.. for now.
    return <li className='room'>
      <span className='id'>
        #{this.props.room.id}
      </span>
      {this.props.room.name}
    </li>;
  }
}
