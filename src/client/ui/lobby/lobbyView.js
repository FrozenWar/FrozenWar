import React from 'react';

import RoomList from './roomList.js';
import UserList from './userList.js';

export default class LobbyView extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <div className='view lobby'>
      <RoomList rooms={this.props.channel.getRooms()} />
      <UserList users={this.props.channel.getUsers()} />
    </div>;
  }
}
