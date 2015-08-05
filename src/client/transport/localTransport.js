import Q from 'q';

import Transport from './transport.js';
import Channel from '../../server/channel.js';
import User from '../../server/user.js';

export default class LocalTransport extends Transport {
  init() {
    this.channel = new Channel();
    // TODO register events to channel
    // register channel to global scope for debugging
    window.channel = this.channel;
    setTimeout(this.emit.bind(this, 'connect'), 0);
  }
  validateNickname(nickname) {
    return Q.fcall(() => {
      if (nickname === '') return false;
      return true;
    });
  }
  login(credentials) {
    console.log('Login:', credentials);
    let user = new User(credentials);
    this.channel.addUser(user);
    this.emit('game:start');
    // setTimeout(this.emit.bind(this, 'game:start'), 0);
  }
  chat(message) {
    this.emit('chat', message);
  }
}
