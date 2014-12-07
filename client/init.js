var path = '/js/';
var loadCount = 0;
var domain;
var module = {exports: {}};
var room = {};
var id = 0;
var socket;
var username = '';
var isServer = false;

var logger = {
    log: function(data) {
        console.log(data);
        var p = document.createElement('p');
        p.appendChild(document.createTextNode(data));
        p.className = 'verbose log';
        logger.chatBox.appendChild(p);
        logger.scrollDown();
    },
    info: function(data) {
        console.info(data);
        var p = document.createElement('p');
        p.appendChild(document.createTextNode(data));
        p.className = 'info log';
        logger.chatBox.appendChild(p);
        logger.scrollDown();
    },
    warn: function(data) {
        console.warn(data);
        var p = document.createElement('p');
        p.appendChild(document.createTextNode(data));
        p.className = 'warn log';
        logger.chatBox.appendChild(p);
        logger.scrollDown();
    },
    error: function(data) {
        console.error(data);
        var p = document.createElement('p');
        p.appendChild(document.createTextNode(data));
        p.className = 'error log';
        logger.chatBox.appendChild(p);
        logger.scrollDown();
    },
    msg: function(data) {
        console.info(data);
        var p = document.createElement('p');
        p.appendChild(document.createTextNode(data));
        p.className = 'msg log';
        logger.chatBox.appendChild(p);
        logger.scrollDown();
    },
    scrollDown: function() {
        logger.chatBox.scrollTop = logger.chatBox.scrollHeight;
    },
    chatBox: null
}

var lobby = {
    redraw: function(room) {
        while (lobby.lobbyList.firstChild) {
        lobby.lobbyList.removeChild(lobby.lobbyList.firstChild);
        }
        for(var i = 0; i < room.clients.length; ++i) {
            var userListItem = document.createElement('li');
            userListItem.appendChild(document.createTextNode(room.clients[i].nickname + ' #'+room.clients[i].id));
            lobby.lobbyList.appendChild(userListItem);
        }
    },
    show: function() {
        lobby.lobby.style.display = 'block';
    },
    hide: function() {
        lobby.lobby.style.display = 'none';
    },
    lobby: null,
    lobbyList: null
}

$(function() {
    logger.chatBox = document.getElementById('chat');
    lobby.lobby = document.getElementById('lobby');
    lobby.lobbyList = document.getElementById('lobbyList');
    lobby.hide();
    domain = new Domain();
    $.ajax({
        url: '/js/urls.json', 
        dataType: 'json'
    }).done(function(data) {
        logger.log(data.length+' files to load');
        data.forEach(function(value) {
            $.getScript(path+value, function() {
                loadCount --;
                if(loadCount <= 0) {
                    logger.info('Loaded, Connecting to server');
                    init();
                } else {
                    logger.log('Loading, '+loadCount+' items left');
                }
            });
            loadCount ++;
        });
    });
});

function init() {
    socket = io();
    document.getElementById('textForm').onsubmit = function() {
        if(this.chat.value.trim() == '') return false;
        socket.emit('chat', this.chat.value);
        this.chat.value = '';
        return false;
    }
    socket.on('handshake', function(data, gotId) {
        id = gotId;
        var valid = true;
        data.forEach(function(key) {
            if(domain.get(key) == null) {
                logger.error('Domain not found: '+key);
                valid = false;
            } else {
                logger.log('Matching domain: '+key);
            }
        });
        if(!valid) {
            logger.error('Closing connection');
            socket.close();
        } else {
            logger.info('Connected to the server!');
            username = prompt('Please type your nickname.');
            socket.emit('nickname', username, function() {
                logger.log('Nickname set');
                var roomId = prompt('Please type the room ID.');
                socket.emit('roomConnect', roomId, function(data) {
                    if(data == null) {
                        logger.error('There was an error processing your request.');
                        socket.close();
                    } else {
                        lobby.show();
                        logger.log(JSON.stringify(data));
                        room = data;
                        lobby.redraw(data);
                    }
                });
            });
        }
    });
    socket.on('roomUpdate', function(data) {
        logger.log(JSON.stringify(data));
        room = data;
        lobby.redraw(data);
    });
    socket.on('chat', function(user, value) {
        logger.msg(user.nickname+' : '+value);
    });
    socket.on('disconnect', function() {
        logger.error('Disconnected');
    });
    socket.on('startSession', function(session) {
        
    });
}

function startGame() {
    socket.emit('startSession');
}
