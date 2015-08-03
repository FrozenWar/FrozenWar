import React from 'react';

import autoDetectTransport from '../transport/autoDetect.js';
import ChatConsole from './chat/chatConsole.js';
import MessageList from './chat/messageList.js';
import LoginView from './login/loginView.js';
import DialogView from './dialogView.js';
import GameView from './game/gameView.js';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: DialogView,
      props: {
        type: 'progress',
        name: 'Connecting',
        data: 'Connecting to the server...'
      }
    };
  }
  componentDidMount() {
    this.transport = autoDetectTransport(this);
    this.transport.init();
    this.transport.on('connect', () => {
      this.chat.log('Connected');
      this.setView(LoginView, {
        onSubmit: (name) => {
          this.chat.log('Trying to login with nickname ' + name);
          // Submit login data to the server
          this.transport.login(name);
        }
      });
    });
    this.transport.on('error', (error) => {
      this.setView(DialogView, {
        type: 'error',
        name: 'Error',
        data: error.toString()
      });
    });
    this.transport.on('disconnect', () => {
      this.chat.log('Lost connection');
      this.setView(DialogView, {
        type: 'error',
        name: 'Connection Lost',
        data: 'Lost connection from the server.'
      });
    });
    this.transport.on('chat', (message) => {
      this.chat.log(message);
    });
    this.transport.on('game:start', () => {
      this.chat.log('Game start');
      this.setView(GameView, {
        engine: this.props.engine
      });
    });
    this.chat = new ChatConsole(this.refs.chat);
    this.chat.log('Application starting up');
  }
  setView(view, props) {
    this.setState({
      view: view,
      props: props
    });
  }
  render() {
    let CurrentView = this.state.view;
    return <div className='app'>
      <CurrentView {... this.state.props} app={this} />
      <MessageList ref='chat' />
    </div>;
  }
}
