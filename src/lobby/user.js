let id = 0;

export default class User {
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }
  static getNextId() {
    return id++;
  }
}