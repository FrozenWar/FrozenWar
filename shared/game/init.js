// Basicially the client and the server will call init first.

domain.assign('init', function(isServer, rawSession) {
    if(isServer) {
        // Server code here...
        var map = new Map(10, 10);
        var session = new Session(true, map, domain);
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
        // Spawn grass
        session.map.forEachTile(function(tile) {
            var entity = session.spawnEntity('grassEntity');
            entity.components['posComp'].x = tile.position.x;
            entity.components['posComp'].y = tile.position.y;
            tile.children.push(entity);
        });
        var tile = session.map.getTileByOffset(new Point(3,3));
        var entity = session.spawnEntity('warriorEntity');
        entity.components['posComp'].x = tile.position.x;
        entity.components['posComp'].y = tile.position.y;
        tile.children.push(entity);
        return session;
    } else {
        // Client code here...
        var map = new Map(rawSession.map.width, rawSession.map.height);
        var session = new Session(false, map, domain);
        rawSession.map.entities.forEach(function(value) {
            var entity = new Entity(session, value.id);
            entity.components = value.components;
            var tile = map.getTile(entity.components['posComp']);
            tile.children.push(entity);
        });
        rawSession.players.forEach(function(value) {
          var player = new Player(null);
          player.id = value.id;
          player.name = value.name;
          player.components = value.components;
          session.addPlayer(player);
        });
        rawSession.turns.forEach(function(value) {
          var turn = new Turn(value.id);
          turn.order = value.order;
          value.actions.forEach(function(value2) {
              var action = new Action(value2.domain, session, session.getPlayer(value2.player), value2.entity, value2.args);
              action.result = value2.result;
              turn.actions.push(action);
          });
          session.turns[value.id] = turn;
        });
        rawSession.systems.forEach(function(value) {
          session.addSystem(value);
        });
        session.turnId = rawSession.turnId;
        return session;
    }
});
