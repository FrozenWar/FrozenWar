var isProduction = process.env.NODE_ENV && process.env.NODE_ENV.trim().toLowerCase() == 'production';

var express = require('express');
var serveStatic = require('serve-static');

var app = module.exports = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/js', serveStatic(__dirname + '/client'));
app.use('/js', serveStatic(__dirname + '/shared'));
app.use(serveStatic(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

if (!module.parent) {
    var server = http.listen(isProduction ? 80 : 3001, function(err) {
        console.log('Listening on port %d', server.address().port);
    });
}

var domain = require('./server/loader');
console.log('Loaded game data.');
console.log(domain.keys());

var clients = [];
var rooms = [];

var Client = function(socket) {
    this.socket = socket;
    this.id = Client._clientId++;
    this.nickname = null;
    this.room = null;
}

Client.prototype.serialize = function() {
    return {
        id: this.id,
        nickname: this.nickname
    };
}

Client._clientId = 0;

function getClientById(id) {
    for(var i = 0; i < clients.length; ++i) {
        if(clients[i].id == id) return clients[i];
    }
}

var Room = function(name) {
    this.name = name;
    this.clients = [];
    this.session = null;
}

Room.prototype.serialize = function() {
    return {
        name: this.name,
        clients: (function(it) {
            var arr = [];
            it.clients.forEach(function(value) {
                arr.push(value.serialize());
            });
            return arr;
        })(this)
    };
}

io.on('connection', function(socket){
    console.log('Client connected, sending domain list');
    var client = new Client(socket);
    clients.push(client);
    socket.emit('handshake', domain.keys(), client.id);
    socket.on('nickname', function(nickname, callback) {
        console.log(nickname + ' connected');
        client.nickname = nickname;
        callback();
    });
    socket.on('roomConnect', function(roomId, callback) {
        console.log(client.nickname + ' joined to room '+roomId);
        if(rooms[roomId]) {
            var room = rooms[roomId];
            room.clients.push(client);
            io.to('room_'+roomId).emit('roomUpdate', room.serialize()); 
            socket.join('room_'+roomId);
            client.room = room;
            callback(room.serialize());
        } else {
            console.log('new room');
            var room = new Room(roomId);
            rooms[roomId] = room;
            room.clients.push(client);
            socket.join('room_'+roomId);
            client.room = room;
            callback(room.serialize());
        }
    });
    socket.on('chat', function(value) {
        console.log(client.nickname + ':' + value);
        if(client.room) {
            io.to('room_'+client.room.name).emit('chat', client.serialize(), value); 
        }
    });
    socket.on('startSession', function(){
        console.log(client.nickname + ' game start');
        var room = client.room;
        if(!room) return;
        if(room.session) {
            return;
        }
        // Start game session
        var session = domain.get('init')(true);
        room.clients.forEach(function(value) {
            var player = new domain.Player(value);
            session.addPlayer(player);
            value.player = player;
            player.name = value.nickname;
        });
        room.session = session;
        // Send map information
        room.clients.forEach(function(value) {
            value.socket.emit('startSession', session.serialize(), value.player.id);
        });
        room.sendTurn = 0;
        room.sendOrder = 0;
        // Wait for clients to load...
        setTimeout(function() {
            finishOrder(session, room);
        }, 2000);
    });
    socket.on('action', function(action, callback){
        console.log(client.nickname + ' action issued');
        var room = client.room;
        if(!room) return;
        if(room.session.getTurn().order != client.player.id) {
            callback(null, 'Not your turn yet');
            socket.emit('error', 'Not your turn yet');
            return;
        }
        callback(runAction(room.session, room, client, action));
    });
    socket.on('endTurn', function(){
        console.log(client.nickname + ' action issued');
        var room = client.room;
        if(!room) return;
        if(room.session.getTurn().order != client.player.id) {
            socket.emit('error', 'Not your turn yet');
            return;
        }
        finishOrder(room.session, room);
    });
    socket.on('disconnect', function(){
        console.log(client.nickname + ' disconnected');
        if(client.room) {
            client.room.clients.splice(client.room.clients.indexOf(client), 1);
            io.to('room_'+client.room.name).emit('roomUpdate', client.room.serialize()); 
        }
        clients.splice(clients.indexOf(client), 1);
    });
});

function finishOrder(session, room) {
    var turn = session.next();
    while(room.sendTurn < session.turns.length) {
        var pastTurn = session.turns[room.sendTurn];
        // TODO more efficient way to send actions
        io.to('room_'+room.name).emit('turnUpdate', pastTurn);
        room.sendTurn++;
        room.sendOrder = 0;
    }
    io.to('room_'+room.name).emit('turnOrder', turn.order, session.turnId);
}

function runAction(session, room, client, action) {
    var actionObj = new domain.Action(action.domain, session, client.player, 
        session.searchEntity(action.entity), action.args);
    session.runAction(actionObj);
    return actionObj;
}
