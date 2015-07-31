import React from 'react';
import io from 'socket.io-client';

import LoginView from './login/loginView.js';
import DialogView from './dialogView.js';

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
    // Make a connection manager? It shouldn't be here...
    this.socket = io(null, {
      reconnection: false,
      timeout: 1000
    });
    this.socket.on('connect', () => {
      this.setView(LoginView, {
        onSubmit: (name) => {
          // Submit login data to the server
          this.socket.emit('login', name);
        }
      });
    });
    this.socket.on('error', (error) => {
      console.log('Error!!');
      this.setView(DialogView, {
        type: 'error',
        name: 'Error',
        data: error.toString()
      });
    });
    this.socket.on('disconnect', () => {
      this.setView(DialogView, {
        type: 'error',
        name: 'Connection Lost',
        data: 'Lost connection from the server.'
      });
    });
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
    </div>;
  }
}
