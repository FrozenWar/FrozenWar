import Q from 'q';

import Transport from './transport.js';

export default class LocalTransport extends Transport {
  init() {
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
  }
}
