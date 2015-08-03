import {EventEmitter} from 'events';
/**
 * A class that communicates with the server.
 */
export default class Transport extends EventEmitter {
  constructor(app) {
    super();
    this.app = app;
  }
  init() {
    throw new Error('Not implemented');
  }
  validateNickname() {
    throw new Error('Not implemented');
  }
  login() {
    throw new Error('Not implemented');
  }
}
