import React from 'react';

import MessageList from './messageList.js';
import MessageForm from './messageForm.js';

export default class MessageBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: []
    };
  }
  sendMessage(message) {
    this.props.app.transport.chat(message);
  }
  render() {
    return <div className='chat'>
      <MessageList messages={this.state.messages} />
      <MessageForm onSubmit={this.sendMessage.bind(this)} />
    </div>;
  }
}
