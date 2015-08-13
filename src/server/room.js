import _ from 'lodash';
import {EventEmitter} from 'events';

let roomId = 0;

export default class Room extends EventEmitter {
  constructor(name, id) {
    super();
    if (id == null) id = Room.getNextId();
    this.users = {};
    this.id = id;
    // TODO default options
    this.options = {};
    this.name = name;
  }
  getUsers() {
    return _.values(this.users);
  }
  getUser(id) {
    return this.users[id];
  }
  addUser(user) {
    if (user.room != null) {
      throw new Error('User cannnot join two rooms at once');
    }
    if (this.users[user.id] != null) return;
    user.room = this;
    this.users[user.id] = user;
    this.emit('user:add', user);
  }
  removeUser(user) {
    if (this.users[user.id] == null) return;
    user.room = null;
    delete this.users[user.id];
    this.emit('user:remove', user);
  }
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      options: this.options,
      users: this.getUsers()
    };
  }
  static getNextId() {
    return roomId++;
  }
}
