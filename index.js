var isProduction = process.env.NODE_ENV && process.env.NODE_ENV.trim().toLowerCase() == 'production';

var express = require('express');
var serveStatic = require('serve-static');

var app = module.exports = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var fs = require('fs');
var path = require('path');

app.use('/js/shared/', serveStatic(__dirname + '/shared'));
app.use(serveStatic(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

if (!module.parent) {
    var server = http.listen(isProduction ? 80 : 8000, function(err) {
        console.log('Listening on port %d', server.address().port);
    });
}

var domain = require('./server/loader');
console.log('Loaded game data.');
console.log(domain.keys());

var clients = [];
var session = null;
var chatLog = null;

var Client = function(socket) {
  this.socket = socket;
  this.id = Client._clientId++;
  this.name = 'unset';
  this.team = 'pony_earth';
  this.ready = false;
  this.player = null;
}

Client.prototype.serialize = function() {
  return {
    id: this.id,
    name: this.name,
    ready: this.ready,
    team: this.team,
    playerId: (function(self) {
      if(self.player) {
        return self.player.id;
      }
      return null;
    })(this)
  };
}

Client._clientId = 0;

function getClientById(id) {
  for(var i = 0; i < clients.length; ++i) {
    if(clients[i].id == id) return clients[i];
  }
}

function clientsSerialize() {
  var arr = [];
  clients.forEach(function(value) {
    arr.push(value.serialize());
  });
  return arr;
}

function saveReplay(callback) {
  var serializedSession = session.serialize();
  serializedSession.chatLog = chatLog;
  var textData = JSON.stringify(serializedSession);
  var userString = '_';
  session.players.forEach(function(player) {
    userString += player.name + '_';
  });
  var fileName = 'game_log'+userString+new Date().toISOString()+'.json';
  fs.writeFile(path.resolve(path.resolve(__dirname, 'logs'), fileName), textData, callback);
}

io.on('connection', function(socket){
    console.log('A client connected, sending domain list');
    var client = new Client(socket);
    clients.push(client);
    socket.emit('handshake', domain.keys(), client.id, session != null);
    socket.on('handshake', function(name, callback) {
      /*session = null;
      io.emit('stopSession');*/
      if(session) {
        setTimeout(function() {
          socket.emit('startSession', session.serialize(), -2);
        }, 10);
      }
      console.log(name + ' connected');
      client.name = name;
      io.emit('join', client.serialize()); 
      if(callback) callback(clientsSerialize());
    });
    socket.on('chat', function(value) {
      console.log(client.name+': '+value);
      io.emit('chat', client.serialize(), value); 
      if(session) {
        if(!chatLog) {
          chatLog = {};
        }
        if(!chatLog[session.turnId]) {
          chatLog[session.turnId] = {};
        }
        if(!chatLog[session.turnId][session.getTurn().actions.length]) {
          chatLog[session.turnId][session.getTurn().actions.length] = [];
        }
        chatLog[session.turnId][session.getTurn().actions.length].push({
          name: client.name,
          message: value
        });
      }
    });
    socket.on('disconnect', function(){
      if(client.player) {
        if(session) {
          console.log('Session stopped');
          saveReplay();
          session = null;
          io.emit('stopSession');
        }
      }
      console.log(client.name + ' disconnected');
      io.emit('leave', client.serialize()); 
      clients.splice(clients.indexOf(client), 1);
      clients.forEach(function(value) {
        value.ready = false;
        io.emit('update', value.serialize());
      });
    });
    socket.on('toggleReady', function(ready){
      if(ready != !!ready) return;
      console.log(client.name + ' set ready to ' + ready);
      client.ready = ready;
      io.emit('update', client.serialize());
      var failed = false;
      clients.forEach(function(e) {
        if(!e.ready) failed = true;
      });
      if(!failed) {
        console.log('game ready to start');
        if(!session) {
          startGameSession();
        }
      }
    });
    socket.on('setTeam', function(team){
      if(!team) return;
      console.log(client.name + ' set team to ' + team);
      client.team = team;
      io.emit('update', client.serialize());
    });
    socket.on('action', function(action){
      if(!session) return;
      if(!client.player) return;
      if(!action) return;
      if(session.getTurn().order != client.player.id) {
        socket.emit('error', 'Not your turn yet');
        return;
      }
      console.log(client.name+' issued '+action.domain);
      try {
        runAction(session, client, action);
      } catch (e) {
        console.log(e.stack);
        io.emit('err', e.stack);
      }
    });
    socket.on('turn', function(){
      if(!session) return;
      if(!client.player) return;
      if(session.getTurn().order != client.player.id) {
        socket.emit('err', 'Not your turn yet');
        return;
      }
      console.log(client.name+' ended turn');
      finishOrder(session);
    });
    socket.on('error', function(e){
      console.log(e.stack);
      io.emit('err', e.stack);
    });
});

function startGameSession() {
  chatLog = {};
  session = domain.get('Linit')(true);
  session.addHook({
    action: function(session) {
      console.log('action '+session.getLastAction().domain);
      io.emit('action', session.getLastAction().serialize());
    },
    order: function(session) {
      var playerId = session.getTurn().order;
      if(session.getPlayer())
        playerId = session.getPlayer().name;
      console.log('-- '+playerId+'\'s turn.'); 
      io.emit('order', session.getTurn().order);
    },
    turn: function(session) {
      console.log('-- Turn '+(session.getTurn().id+1)); 
      io.emit('turn', session.getTurn().id);
    }
  });
  session.debug = false;
  clients.forEach(function(client) {
    var player = new domain.Player();
    player.client = client;
    session.addPlayer(player);
    client.player = player;
    player.name = client.name;
    player.resources['clientId'] = client.id;
    player.resources['team'] = client.team;
  });
  var sessionSerialized = session.serialize();
  clients.forEach(function(client) {
    client.socket.emit('startSession', sessionSerialized, client.player.id);
  });
  try {
    session.next();
  } catch (e) {
    console.log(e.stack);
    io.emit('err', e.stack);
  }
}

function finishOrder(session) {
  try {
    session.next();
  } catch (e) {
    console.log(e.stack);
    io.emit('err', e.stack);
  }
}

function runAction(session, client, action) {
  var actionObj = new domain.Action(action.domain, session, client.player, 
      session.map.searchEntity(action.entity), action.args);
  session.runAction(actionObj);
}

process.on('SIGINT', function() {
  console.log('SIGINT');
  io.emit('err', 'Server got SIGINT');
  if(session) {
    saveReplay(function() {
      process.exit(0);
    });
  } else {
    setTimeout(function() {
      process.exit(0);
    }, 5);
  }
});

process.on('SIGHUP', function() {
  console.log('SIGHUP');
  io.emit('err', 'Server got SIGHUP');
  if(session) {
    saveReplay(function() {
      process.exit(0);
    });
  } else {
    setTimeout(function() {
      process.exit(0);
    }, 5);
  }
});
