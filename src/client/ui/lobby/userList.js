import React from 'react';

import User from './user.js';

export default class UserList extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <ul className='user list'>
      {
        this.props.users.map((user, i) => {
          return <User key={i} user={user} />;
        })
      }
    </ul>;
  }
}
