import _ from 'lodash';
import {EventEmitter} from 'events';

export default class Channel extends EventEmitter {
  constructor() {
    super();
    this.users = {};
    this.rooms = {};
  }
  getUsers() {
    return _.values(this.users);
  }
  getUser(id) {
    return this.users[id];
  }
  addUser(user) {
    if (this.users[user.id] != null) return;
    this.users[user.id] = user;
    this.emit('user:add', user);
  }
  removeUser(user) {
    if (this.users[user.id] == null) return;
    // Delete from rooms too
    if (this.users.room != null) {
      let room = this.rooms[room];
      if (room == null) throw new Error('User is in undefined room');
      room.removeUser(user);
    }
    delete this.users[user.id];
    this.emit('user:remove', user);
  }
  getRooms() {
    return _.values(this.rooms);
  }
  getRoom(id) {
    return this.rooms[id];
  }
  addRoom(room) {
    if (this.rooms[room.id] != null) return;
    this.rooms[room.id] = room;
    this.emit('room:add', room);
    room.handleJoin = this.handleRoomJoin.bind(this, room);
    room.on('user:add', room.handleJoin);
    room.handleLeave = this.handleRoomLeave.bind(this, room);
    room.on('user:remove', room.handleLeave);
  }
  removeRoom(room) {
    if (this.rooms[room.id] == null) return;
    // Remove all users from room
    room.getUsers().forEach((user) => {
      user.room = null;
      this.handleRoomLeave(room, user);
    });
    delete this.rooms[room.id];
    this.emit('room:delete', room);
    room.removeListener('user:add', room.handleJoin);
    room.removeListener('user:remove', room.handleLeave);
  }
  handleRoomJoin(room, user) {
    this.emit('room:join', room, user);
  }
  handleRoomLeave(room, user) {
    this.emit('room:leave', room, user);
  }
}
