import Transport from './transport.js';

export default class LocalTransport extends Transport {
  init() {
    setTimeout(this.emit.bind(this, 'connect'), 0);
  }
  login(credentials) {
    console.log('Login:', credentials);
  }
}
