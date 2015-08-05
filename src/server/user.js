let userId = 0;

export default class User {
  constructor(name, id) {
    if (id == null) id = User.getNextId();
    this.id = id;
    this.name = name;
    // TODO default options
    this.options = {};
    this.room = null;
  }
  toJSON() {
    let obj = {
      id: this.id,
      name: this.name,
      options: this.options,
      room: this.room
    };
    if (obj.room) obj.room = obj.room.id;
    return obj;
  }
  static getNextId() {
    return userId++;
  }
}
