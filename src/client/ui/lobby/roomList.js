import React from 'react';

import Room from './room.js';

export default class RoomList extends React.Component {
  constructor(props) {
    super(props);
  }

  handleClick(index) {
    let room = this.props.rooms[index];
    this.props.onJoin(room);
  }

  render() {
    return <ul className='room list'>
      {
        this.props.rooms.map((room, i) => {
          let boundClick = this.handleClick.bind(this, i);
          return <Room key={i} room={room} onClick={boundClick} />;
        })
      }
    </ul>;
  }
}
