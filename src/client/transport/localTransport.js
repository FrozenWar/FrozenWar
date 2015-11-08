import Q from 'q';

import configureStore from '../../game/store.js';
import { spawn, spawnTemplate } from '../../game/actions/spawn.js';
import Transport from './transport.js';
import Channel from '../../server/channel.js';
import User from '../../server/user.js';
import Room from '../../server/room.js';

export default class LocalTransport extends Transport {
  init() {
    this.channel = new Channel();
    // Just example room. heh
    this.channel.addRoom(new Room('Test room'));
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
    this.user = user;
    this.channel.addUser(user);
    let store = configureStore(true);
    store.dispatch(spawn({
      player: {
        name: 'test'
      }
    }));
    store.dispatch(spawnTemplate('TestEntity', {
      pos: {
        x: 4, y: 4
      }
    }));
    // Expose engine to global scope
    window.engine = store;
    // this.emit('login');
    this.emit('game:start', store);
    // setTimeout(this.emit.bind(this, 'game:start'), 0);
  }
  joinRoom(room) {
    console.log('Join:', room);
    // TODO Handle room join
  }
  chat(message) {
    this.emit('chat', message);
  }
}
