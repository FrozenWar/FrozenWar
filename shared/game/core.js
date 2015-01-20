/*
function startGameSession() {
  var map = new Map(15, 15);
  // 네 이거 클라이언트긴 한데 내부적으론 서버로도 동작
  session = new Session(true, map, domain);
  // Discover systems
  var systemList = [];
  domain.keys().forEach(function(key) {
      if(domain.get(key).system != null) {
          systemList.push({key: key, level: domain.get(key).system});
      }
  });
  systemList.sort(function(a, b) {
      return a.level - b.level;
  });
  systemList.forEach(function(domain) {
      session.addSystem(domain.key);
  });
  return session;
}

function runAction(action) {
  var action;
  try {
    action = this.session.runAction(new Action(action.domain, session, session.getPlayer(), action.entity, action.args));
  } catch (e) {
    console.log(e);
    alertify.error(e.toString());
  }
  return action;
}
*/ //이것들은 클라이언트에서..

domain.assign('LhexDist',function (p1, p2) {
  return (Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y) +
          Math.abs(p1.x + p1.y - p2.x - p2.y)) / 2;
});

domain.assign('Cpos', {
  x: 0, y: 0
});

// Will not be implemented in prototype
domain.assign('Ctile', {
  name: 'undefined',
  sight: {}
});
domain.assign('Cbuilding', {
  name: 'undefined',
  team: null
});
domain.assign('Cunit', {
  name: 'undefined',
  team: null
});

domain.assign('Cown', {
  player: -1,
  sight: 1
});
domain.assign('AchangePlayer', {
  depends: ['Cown'],
  debug: true,
  run: function() {
    if(this.entity.get('Cown').player != this.player.id) {
      throw new Error('That is not your entity.');
    }
    this.result = this.entity.get('Cown').player;
    this.entity.get('Cown').player = this.args;
  }
});

domain.assign('SspawnBase', {
  system: 10,
  init: function(session) {
    session.players.forEach(function(player) {
      if(session.isServer) {
        var x = session.map.width * Math.random() | 0;
        var y = session.map.height * Math.random() | 0;
        var setDomain = 'EEarthPonyBase';
        if(player.resources['team'] == 'pony_pegasus') setDomain = 'EPegasusPonyBase';
        if(player.resources['team'] == 'pony_unicorn') setDomain = 'EUnicornPonyBase';
        // You what mate?
        if(player.resources['team'] == 'debug') setDomain = 'EDebugBase';
        session.runAction(new Action('AspawnRaw', session, null, null, {
          x: x - (y/2 | 0),
          y: y,
          domain: setDomain,
          player: player.id
        }));
      }
      player.resources['supply'] = 250;
      player.resources['troops'] = 500;
    });
  }
});

domain.assign('SresourceGive', {
  system: 100,
  turn: function(session) {
    if(session.turnId <= 0) return;
    session.players.forEach(function(player) {
      player.resources['supply'] += 30;
      player.resources['troops'] += 100;
    });
  }
});
