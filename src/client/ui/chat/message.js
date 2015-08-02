import React from 'react';

export default class Message extends React.Component {
  render() {
    return <p className='message'>
      <span className={this.props.type}>
        {this.props.text}
      </span>
    </p>;
  }
}
