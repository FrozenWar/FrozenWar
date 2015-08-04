let id = 0;

export default class Room {
  constructor(id, name) {
    this.users = {};
    this.id = id;
    this.name = name;
  }
  static getNextId() {
    return id++;
  }
}