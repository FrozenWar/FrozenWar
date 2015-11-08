import React, { cloneElement } from 'react';

import autoDetectTransport from '../transport/autoDetect.js';
import ChatConsole from './chat/chatConsole.js';
import MessageBox from './chat/messageBox.js';
import LoginView from './login/loginView.js';
import DialogView from './dialogView.js';
import GameView from './game/gameView.js';
import LobbyView from './lobby/lobbyView.js';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view:
        <DialogView type='progress' name='Connecting'>
          Connecting to the server...
        </DialogView>
    };
  }
  componentDidMount() {
    this.transport = autoDetectTransport(this);
    this.transport.init();
    this.transport.on('connect', () => {
      this.chat.log('Connected');
      let onsubmit = (name) => {
        this.chat.log('Trying to login with nickname ' + name);
        // Submit login data to the server
        this.transport.login(name);
      };
      this.setView(
        <LoginView onSubmit={onsubmit} />
      );
    });
    this.transport.on('login', () => {
      this.setView(
        <LobbyView channel={this.transport.channel} />
      );
    });
    this.transport.on('error', (error) => {
      this.setView(
        <DialogView type='error' name='Error'>
          {error.toString()}
        </DialogView>
      );
    });
    this.transport.on('disconnect', () => {
      this.chat.log('Lost connection');
      this.setView(
        <DialogView type='error' name='Connection Lost'>
          Lost connection from the server
        </DialogView>
      );
    });
    this.transport.on('chat', (message) => {
      this.chat.log(message);
    });
    this.transport.on('game:start', (engine) => {
      this.chat.log('Game start');
      this.setView(
        <GameView engine={engine} />
      );
    });
    this.chat = new ChatConsole(this.refs.chat);
    this.chat.log('Application starting up');
  }
  setView(view) {
    this.setState({
      view: view
    });
  }
  render() {
    return <div className='app'>
      {cloneElement(this.state.view,
        Object.assign({}, this.props, { app: this }))}
      <MessageBox app={this} ref='chat' />
    </div>;
  }
}
