import React from 'react';

import RoomList from './roomList.js';
import UserList from './userList.js';

export default class LobbyView extends React.Component {
  constructor(props) {
    super(props);
  }

  handleRoomJoin(room) {
    // Send join request to the server
    this.props.app.transport.joinRoom(room);
  }

  render() {
    return <div className='view lobby'>
      <RoomList rooms={this.props.channel.getRooms()}
          onJoin={this.handleRoomJoin.bind(this)} />
      <UserList users={this.props.channel.getUsers()} />
    </div>;
  }
}
