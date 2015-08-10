import React from 'react';

export default class User extends React.Component {
  render() {
    // Why am I using a class?
    return <li className='user'>
      <span className='id'>
        #{this.props.user.id}
      </span>
      {this.props.user.name}
    </li>;
  }
}
