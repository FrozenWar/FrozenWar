import React from 'react';

import Room from './room.js';

export default class RoomList extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <ul className='room list'>
      {
        this.props.rooms.map((room, i) => {
          return <Room key={i} room={room} />;
        })
      }
    </ul>;
  }
}
