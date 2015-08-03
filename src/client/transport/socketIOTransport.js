import io from 'socket.io-client';
import Q from 'q';

import Transport from './transport.js';

export default class SocketIOTransport extends Transport {
  init() {
    this.socket = io(null, {
      reconnection: false,
      timeout: 1000
    });
    this.socket.on('connect', this.emit.bind(this, 'connect'));
    this.socket.on('error', this.emit.bind(this, 'error'));
    this.socket.on('disconnect', this.emit.bind(this, 'disconnect'));
  }
  validateNickname(nickname) {
    return Q.ninvoke(this.socket, 'emit', 'login:validate', nickname);
  }
  login(credentials) {
    this.socket.emit('login', credentials);
  }
}
