var Client = function(name, protocol) {
  this.id = Client._clientId++;
  this.protocol = null;
  this.name = null;
  this.room = null;
  this.player = null;
  
  this.data = {};
}
Client._clientId = 0;

Client.prototype.serialize = function() {
  return {
    id: this.id,
    name: this.name,
    room: this.room && this.room.id,
    data: this.data
  };
}

Client.prototype.sendRoomInfo = function(room) {
  this.protocol.sendRoomInfo(room.serialize());
}

Client.prototype.sendChat = function(sender, message) {
  this.protocol.sendChat(sender.serialize(), message);
}

module.exports.Client = Client;

var Room = function(name) {
  this.id = Room._roomId++;
  this.name = name;
  this.clients = [];
  this.session = null;
  
  this.data = {};
}
Room._roomId = 0;

Room.prototype.serialize = function() {
  return {
    name: this.name,
    clients: (function(it) {
      var arr = [];
      it.clients.forEach(function(value) {
        arr.push(value.serialize());
      });
      return arr;
    })(this),
    data: data
  };
}

Room.prototype.sendInfo = function(target) {
  if(!target) {
    this.clients.forEach(function(client) {
      this.sendInfo(client);
    });
    return;
  }
  target.sendRoomInfo(this);
}

Room.prototype.sendChat = function(sender, message) {
  this.clients.forEach(function(client) {
    client.sendChat(sender, message);
  });
}

Room.prototype.addClient = function(client) {
  this.clients.push(client);
  this.clients.forEach(function(listener) {
    listener.sendRoomJoin(client);
  });
}

Room.prototype.removeClient = function(client) {
  this.clients.splice(this.clients.indexOf(client), 1);
  this.clients.forEach(function(listener) {
    listener.sendRoomLeave(client);
  });
}

module.exports.Room = Room;

var Server = function() {
  this.clients = [];
  this.rooms = [];
}

Server.prototype.getLobby = function() {
  if(this._lobby) {
    var lobby = new Room();
    this._lobby = lobby;
    lobby.name = 'Lobby';
    lobby.data.isLobby = true;
  }
}

Server.prototype.addRoom = function(room) {
  this.rooms.push(room);
}

Server.prototype.removeRoom = function(room) {
  this.rooms.splice(this.rooms.indexOf(room), 1);
}

Server.prototype.addClient = function(client) {
  this.clients.push(client);
}

Server.prototype.removeClient = function(client) {
  this.clients.splice(this.clients.indexOf(client), 1);
}

Server.prototype.handleConnect = function(client) {
  this.addClient(client);
  console.log(client.name + ' has connected');
  // TODO put client in lobby
}

Server.prototype.handleDisconnect = function(client) {
  this.removeClient(client);
  console.log(client.name + ' has disconnected');
  // TODO handle leave
}

Server.prototype.handleJoinRoom = function(client, room) {
  // TODO handle leave
  
}

Server.prototype.handleCreateRoom = function(client, room) {
  // create room objects on the server,
  // handle leave and join(handleJoinRoom)
}

Server.prototype.handleUpdateRoom = function(client, data) {
  
}

Server.prototype.handleUpdateSelf = function(client, data) {
  
}

Server.prototype.handleSessionStart = function(client) {
  
}

Server.prototype.handleSessionAction = function(client, action) {
  
}

Server.prototype.handleSessionTurn = function(client) {
  
}
