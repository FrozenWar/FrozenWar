import React from 'react';

import GameView from './game/gameView.js';
import LoginView from './login/loginView.js';

export default class App extends React.Component {
  render() {
    return <div>
      <LoginView />
      <GameView engine={this.props.engine} />
    </div>;
  }
}
