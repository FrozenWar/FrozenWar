import React from 'react';

import autoDetectTransport from '../transport/autoDetect.js';

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
    this.transport = autoDetectTransport(this);
    this.transport.init();
    this.transport.on('connect', () => {
      this.setView(LoginView, {
        onSubmit: (name) => {
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
