var logger, domain, socket, selfClient, playerId;
var clients = [];

var chatLog = {};

function runAction(action) {
  socket.emit('action', action.serialize());
}

function endTurn() {
  socket.emit('turn');
}

function saveReplayFile() {
  var dom = logger.log('Press here to download replay file: ');
  var downloadTag = document.createElement("a");
  dom.appendChild(downloadTag);
  downloadTag.appendChild(document.createTextNode('Save replay file'));
  var serializedSession = session.serialize();
  serializedSession.chatLog = chatLog;
  blob = new Blob([JSON.stringify(serializedSession)], {type: "octet/stream"}),
  url = window.URL.createObjectURL(blob);
  downloadTag.href = url;
  var userString = '_';
  session.players.forEach(function(player) {
    userString += player.name + '_';
  });
  downloadTag.download = 'game_log'+userString+new Date().toISOString()+'.json';
}

function startInit(ignore) {
  var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  if(!is_chrome && !ignore) {
    alertify.alert('Please use Chrome browser. This program is not optimized yet, so it would run very slowly or don\'t work on other browsers.', function() {
      startInit(true);
    });
    return;
  }
  logger = new Logger(document.getElementById('chatLog'));
  logger.clear();
  logger.log(_('receiveDataFromServer'), 'info');
  $.ajax({
    url: './js/shared/urls.json', 
    dataType: 'json'
  }).done(function(urls) {
    urls.unshift('base.js');
    logger.log(_('toLoadFiles', urls.length), 'info');
    function loadNext(){
      var current = urls.shift();
      if(!current){
        logger.log(_('connectingToServer'), 'info');
        tryConnect();
        return;
      }
      logger.tag(_('toLoadFilesLeft', urls.length+1), current);
      var jsElm = document.createElement('script');
      document.head.appendChild(jsElm);
      jsElm.onload = function() {
        if(!domain){
          domain = new Domain();
        }
        setTimeout(loadNext, 0);
      };
      jsElm.type = 'text/javascript';
      jsElm.src = './js/shared/'+current;
    }
    loadNext();
  });
  $('#textForm').submit(function() {
    if(this.chat.value.trim() == '') return false;
    socket.emit('chat', this.chat.value);
    this.chat.value = '';
    return false;
  });
  $('#start_game').text(_('toggleReady'));
  $('#start_game').click(function() {
    selfClient.ready = !selfClient.ready;
    socket.emit('toggleReady', selfClient.ready);
  });
  $('#change_team').text(_('changeTeam'));
  $('#change_team').click(function() {
    if(selfClient.team == 'pony_earth') {
      selfClient.team = 'pony_pegasus';
    } else if(selfClient.team == 'pony_pegasus') {
      selfClient.team = 'pony_unicorn';
    } else {
      selfClient.team = 'pony_earth';
    }
    socket.emit('setTeam', selfClient.team);
  });
}

function getClientById(id) {
  for(var i = 0; i < clients.length; ++i) {
    if(clients[i].id == id) return clients[i];
  }
}

function tryConnect() {
  socket = io(null, {reconnection: false});
  socket.on('handshake', function(domainList, id, sessionInProgress) {
    selfClient = {};
    selfClient.ready = false;
    selfClient.team = 'pony_earth';
    selfClient.id = id;
    var valid = true;
    domainList.forEach(function(key) {
      if(domain.get(key) == null) {
        logger.tag(_('domainMismatch'), key, 'error');
        valid = false;
      }
    });
    if(!valid) {
      logger.log(_('disconnectDomainMismatch'), 'error');
      socket.close();
    } else {
      alertify.prompt(_('typeNickname'), function(e, str) {
        if(e && str != '') {
          selfClient.name = str;
          if(sessionInProgress) {
            /*alertify.confirm(_('sessionInterruptWarn'), function(e, str) {
              if (e) {
                socket.emit('handshake', selfClient.name, receiveClientList);
              } else {
                socket.close();
              }
            });*/
            // Server will handle it as a spectator by default
            socket.emit('handshake', selfClient.name, receiveClientList);
          } else {
            socket.emit('handshake', selfClient.name, receiveClientList);
          }
        } else {
          logger.log(_('disconnectNicknameFail'), 'error');
          socket.close();
        }
      }, 'User'+(Math.random()*10000|0));
    }
  });
  socket.on('disconnect', function() {
    logger.log(_('disconnected'), 'error');
  });
  socket.on('err', function(error) {
    logger.log(error, 'error');
  });
}

function receiveClientList(clientList) {
  logger.log(_('connectSuccess'), 'info');
  clients = clientList;
  clients.forEach(function(client) {
    appendClientList(client);
  });
  socket.on('join', function(client) {
    logger.log(_('joinServer', client.name));
    if(selfClient.id == client.id) {
      selfClient = client;
      return;
    }
    var existClient = getClientById(client.id);
    if(existClient) {
      clients[clients.indexOf(existClient)] = client;
      updateClientList(client);
      return;
    }
    clients.push(client);
    appendClientList(client);
  });
  socket.on('leave', function(client) {
    logger.log(_('leaveServer', client.name));
    clients.splice(clients.indexOf(client), 1);
    removeClientList(client);
  });
  socket.on('chat', function(client, message) {
    logger.tag(client.name, message);
    if(session) {
      if(!chatLog[session.turnId]) {
        chatLog[session.turnId] = {};
      }
      if(!chatLog[session.turnId][session.getTurn().actions.length]) {
        chatLog[session.turnId][session.getTurn().actions.length] = [];
      }
      chatLog[session.turnId][session.getTurn().actions.length].push({
        name: client.name,
        message: message
      });
    }
  });
  socket.on('update', function(client) {
    var existClient = getClientById(client.id);
    if(client.id == selfClient.id) {
      selfClient = client;
    }
    if(existClient) {
      clients[clients.indexOf(existClient)] = client;
      updateClientList(client);
    } else {
      updateClientList(client);
    }
  });
  socket.on('stopSession', function() {
    if(typeof session != 'undefined') {
      logger.log(_('gameSessionEnd'));
      saveReplayFile();
      $('#lobby').show();
      $('#game').css('display', 'none');
      update();
    }
  });
  socket.on('startSession', function(rawSession, pId) {
    validCanvas = false;
    playerId = pId;
    session = domain.get('Linit')(false, rawSession);
    chatLog = {};
    logger.log(_('gameSessionStart'));
    if(session.turnId == -1) {
      session.turnId ++;
      var turn = new Turn(0);
      session.turns.push(turn);
    }
    session.runSystems('init');
    $('#lobby').hide();
    $('#game').css('display', 'flex');
    update();
  });
  socket.on('turn', function(turnId) {
    session.turnId = turnId;
    if(!session.turns[turnId]) {
      session.turns[turnId] = new Turn(turnId);
    }
    logger.log(_('turnSkipped',turnId+1));
    session.runSystems('turn');
    update();
  });
  socket.on('order', function(order) {
    session.getTurn().order = order;
    if(order < session.players.length) {
      logger.log(_('orderSkipped', session.getPlayer().name));
    }
    session.runSystems('order');
    update();
  });
  socket.on('action', function(rawAction) {
    var player = session.players[rawAction.player];
    var action = new Action(rawAction.domain, session, player, session.map.searchEntity(rawAction.entity), rawAction.args);
    action.result = rawAction.result;
    // 처리 전 엔티티를 복제함.
    if(action.entity) {
      action.entityBackup = JSON.parse(JSON.stringify(action.entity.serialize()));
    }
    if(action.domain == 'Aattack') {
      action.targetBackup = JSON.parse(JSON.stringify(session.map.searchEntity(action.args).serialize()));
    }
    action.run();
    session.getTurn().actions.push(action);
    if(renderActionHook[action.domain]) {
      renderActionHook[action.domain](action);
    }
    session.runSystems('action');
    update();
  });
}

function appendClientList(client) {
  var playerNode = $(playerNodeOrigin.cloneNode(true));
  playerNode.attr('id', client.id);
  playerNode.attr('name', client.name);
  playerNode.attr('ready', client.ready);
  playerNode.find('.name').text(client.name);
  playerNode.find('.team').text(_('team_'+client.team));
  if(client.ready) {
    playerNode.find('.ready').text('✔');
  } else {
    playerNode.find('.ready').text('');
  }
  if(client.id == selfClient.id) {
    playerNode.find('.name').addClass('nameself');
  } else {
    playerNode.find('.name').removeClass('nameself');
  }
  $('#playerList').append(playerNode);
  setTimeout(function() {
    $(playerNode).addClass('player_show');
  }, 12);
}

function removeClientList(client) {
  var playerNode = $('#playerList .player[id=\''+client.id+'\']');
  if(playerNode.length == 0) return;
  playerNode.removeClass('player_show');
  setTimeout(function() {
    playerNode.remove();
  }, 600);
}

function updateClientList(client) {
  console.log('update', client.id, selfClient.id);
  var playerNode = $('#playerList .player[id=\''+client.id+'\']');
  playerNode.attr('id', client.id);
  playerNode.attr('name', client.name);
  playerNode.attr('ready', client.ready);
  playerNode.find('.name').text(client.name);
  playerNode.find('.team').text(_('team_'+client.team));
  if(client.id == selfClient.id) {
    playerNode.find('.name').addClass('nameself');
  } else {
    playerNode.find('.name').removeClass('nameself');
  }
  if(client.ready) {
    playerNode.find('.ready').text('✔');
  } else {
    playerNode.find('.ready').text('');
  }
}
