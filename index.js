var isProduction = process.env.NODE_ENV && process.env.NODE_ENV.trim().toLowerCase() == 'production';
console.log(process.env.NODE_ENV);

var express = require('express');
var serveStatic = require('serve-static');

var app = module.exports = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
}

app.use(allowCrossDomain);

app.use('/js', serveStatic(__dirname + '/client'));
app.use('/js', serveStatic(__dirname + '/shared'));
app.use(serveStatic(__dirname + '/public'));
/*
app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});
*/
if (!module.parent) {
    var server = http.listen(isProduction ? 80 : 8000, function(err) {
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
    console.log('A client connected, sending domain list');
    var client = new Client(socket);
    clients.push(client);
    socket.emit('handshake', domain.keys(), client.id);
    socket.on('nickname', function(nickname, callback) {
        console.log(nickname + ' connected');
        client.nickname = nickname;
        if(callback) callback();
    });
    socket.on('roomConnect', function(roomId, callback) {
        console.log(client.nickname + ' joined to room '+roomId);
        if(rooms[roomId]) {
            var room = rooms[roomId];
            if(room.session) {
                io.to('room_'+client.room.name).emit('err', 'Game in session');
                return;
            }
            room.clients.push(client);
            io.to('room_'+roomId).emit('roomUpdate', room.serialize());
            socket.join('room_'+roomId);
            client.room = room;
            if(callback) callback(room.serialize());
        } else {
            var room = new Room(roomId);
            rooms[roomId] = room;
            room.clients.push(client);
            socket.join('room_'+roomId);
            client.room = room;
            if(callback) callback(room.serialize());
        }
    });
    socket.on('chat', function(value) {
        if(client.room) {
            console.log('['+client.room.name+'] '+client.nickname+': '+value);
            io.to('room_'+client.room.name).emit('chat', client.serialize(), value);
        }
    });
    socket.on('startSession', function(){
        var room = client.room;
        if(!room) return;
        if(room.session) {
            return;
        }
        console.log('['+client.room.name+'] '+client.nickname+' started game session');
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
        finishOrder(session, room);
    });
    socket.on('action', function(action, callback){
        var room = client.room;
        if(!room) return;
        if(!room.session) return;
        if(room.session.getTurn().order != client.player.id) {
            if(callback) callback(null, 'Not your turn yet');
            socket.emit('err', 'Not your turn yet');
            return;
        }
        console.log('['+room.name+'] '+client.nickname+' issued an action');
        var actionObj = runAction(room.session, room, client, action);
        if(callback) callback(actionObj.serialize());
    });
    socket.on('endTurn', function(){
        var room = client.room;
        if(!room) return;
        if(!room.session) return;
        if(room.session.getTurn().order != client.player.id) {
            socket.emit('err', 'Not your turn yet');
            return;
        }
        console.log('['+room.name+'] '+client.nickname+' ended turn');
        finishOrder(room.session, room);
    });
    socket.on('disconnect', function(){
        console.log(client.nickname + ' disconnected');
        if(client.room) {
            client.room.clients.splice(client.room.clients.indexOf(client), 1);
            io.to('room_'+client.room.name).emit('roomUpdate', client.room.serialize());
            if(client.room.session) {
                io.to('room_'+client.room.name).emit('err', 'Room exploded');
                client.room.clients.forEach(function(value) {
                    value.socket.disconnect('unauthorized');
                });
                delete rooms[client.room.name];
            } else {
                if(client.room.clients.length == 0) {
                    delete rooms[client.room.name];
                }
            }
        }
        clients.splice(clients.indexOf(client), 1);
    });
});

function finishOrder(session, room) {
    var turn = session.next();
    while(room.sendTurn < session.turns.length) {
        var pastTurn = session.turns[room.sendTurn];
        // TODO more efficient way to send actions
        io.to('room_'+room.name).emit('turnUpdate', pastTurn.serialize());
        room.sendTurn = session.turns.length - 1;
        break;
        room.sendOrder = 0;
    }
    io.to('room_'+room.name).emit('turnOrder', turn.order, session.turnId);
}

function runAction(session, room, client, action) {
    var actionObj = new domain.Action(action.domain, session, client.player,
        action.entity, action.args);
    session.runAction(actionObj);
    return actionObj;
}
