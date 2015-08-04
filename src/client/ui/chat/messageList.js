import React from 'react';

import Message from './message.js';

export default class MessageList extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <div className='message list'>
      {
        this.props.messages.map((message, i) => {
          return <Message key={i} type={message.type} text={message.text} />;
        })
      }
    </div>;
  }
}
