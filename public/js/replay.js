var logger, domain, selfClient = {}, playerId = -2;
var session;
var replaySession;
var chatLog;
var turnPointer = 0, actionPointer = 0;

function runAction(action) {
}

function endTurn() {
}

function nextReplay() {
  var hasRun = false;
  while(turnPointer < replaySession.turns.length) {
    var turn = replaySession.turns[turnPointer];
    session.turnId = turn.id;
    if(!session.turns[turn.id]) {
      session.turns[turn.id] = new Turn(turn.id);
      logger.log(_('turnSkipped',session.turnId+1));
      session.runSystems('turn');
      update();
    }
    var turnChatLog;
    if(chatLog && chatLog[turnPointer]) turnChatLog = chatLog[turnPointer];
    while(actionPointer < turn.actions.length) {
      if(actionPointer == 0) {
        if(turnChatLog) {
          var actionChatLog = turnChatLog[actionPointer];
          if(actionChatLog) {
            actionChatLog.forEach(function(chat) {
              logger.tag(chat.name, chat.message);
            });
          }
        }
      }
      var rawAction = turn.actions[actionPointer];
      var player = session.players[rawAction.player];
      // order 처리
      if(rawAction.player >= 0 && session.getTurn().order != rawAction.player) {
        session.getTurn().order = rawAction.player;
        if(session.getTurn().order < session.players.length) {
          logger.log(_('orderSkipped', session.getPlayer().name));
        }
        session.runSystems('order');
        update();
      }
      if(rawAction.player >= 0 && hasRun) {
        return;
      }
      if(turnChatLog) {
        var actionChatLog = turnChatLog[actionPointer+1];
        if(actionChatLog) {
          actionChatLog.forEach(function(chat) {
            logger.tag(chat.name, chat.message);
          });
        }
      }
      hasRun = true;
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
      actionPointer ++;
    }
    if(turnChatLog) {
      var actionChatLog = turnChatLog[actionPointer+1];
      if(actionChatLog) {
        actionChatLog.forEach(function(chat) {
          logger.tag(chat.name, chat.message);
        });
      }
    }
    actionPointer = 0;
    turnPointer++;
    if(hasRun) {
      return;
    }
  }
  if(!hasRun) {
    logger.log('Reached the end of replay file', 'error');
  }
}

function startInit(ignore) {
  var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  if(!is_chrome && !ignore) {
    alertify.alert('Please use Chrome browser. This program is not optimized yet, so it would run very slowly on other browsers.', function() {
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
        logger.log('Please select the file.', 'info');
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
  $('#files').change(function(evt) {
    var files = evt.target.files;
    var repFile = files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
      var repText = e.target.result;
      var repData;
      try {
        repData = JSON.parse(repText);
        replaySession = repData;
        logger.log('Checking domains.', 'info');
        replaySession.domain.forEach(function(value) {
          if(!domain.get(value)) {
            throw new Error('domain '+value+' not found');
          }
        });
        chatLog = replaySession.chatLog;
        var map = new Map(replaySession.map.width, replaySession.map.height);
        validCanvas = false;
        session = new Session(false, map, domain);
        replaySession.players.forEach(function(value) {
          var player = new Player(null);
          player.id = value.id;
          player.name = value.name;
          player.resources = value.resources;
          session.addPlayer(player);
        });
        replaySession.systems.forEach(function(value) {
          session.addSystem(value);
        });
        // ready to start
        /*if(session.turnId == -1) {
          session.turnId ++;
          var turn = new Turn(0);
          session.turns.push(turn);
        }*/
        session.runSystems('init');
        $('#lobby').hide();
        $('#game').css('display', 'flex');
        update();
        nextReplay();
        $('#replay_next').click(function() {
          nextReplay();
        });
      } catch (err) {
        logger.log(err, 'error');
        logger.log(err.stack, 'error');
      }
    };
    reader.readAsText(repFile);
  });
}
