// A simple test of server.
var Base = require('../shared/base');

var positionComponent = 'com.example.PositionComponent';

var domain = new Base.Domain();
domain.assign('com.example.PositionComponent', {
    x: 0, y: 0
});
domain.assign('com.example.TileComponent', {
    id: 0, walkable: true
});
domain.assign('com.example.EnergyComponent', {
    energy: 0, energyMax: 100
});
domain.assign('com.example.MovableComponent', {
    energy: 10
});
domain.assign('com.example.OwnerComponent', {
    player: -1
});
domain.assign('com.example.RenderComponent', {
    sprite: null, x: 0, y: 0
});
domain.assign('com.example.GrassEntity', {
    'com.example.PositionComponent': {},
    'com.example.TileComponent': {},
    'com.example.RenderComponent': {
        sprite: 'com.example.assets.GrassAsset'
    },
});
domain.assign('com.example.UnitEntity', {
    'com.example.PositionComponent': {},
    'com.example.EnergyComponent': {},
    'com.example.MovableComponent': {},
    'com.example.OwnerComponent': {},
    'com.example.RenderComponent': {
        sprite: 'com.example.assets.UnitAsset'
    },
});
domain.assign('com.example.EnergySystem', {
    turn: function(session) {
        console.log('com.example.EnergySystem called');
        session.map.forEach(function(entity) {
            var energy = entity.components['com.example.EnergyComponent'];
            if(energy) {
                var action = new Base.Action(
                    'com.example.EnergyHealAction', session, null, entity);
                session.runAction(action);
            }
        });
    }
});
domain.assign('com.example.TurnNotiSystem', {
    init: function(session) {
        console.log('~~ The journey begins... ~~');
    },
    turn: function(session) {
        console.log('~~ Turn '+(session.turnId+1)+' ~~');
    },
    order: function(session) {
        console.log('~~ '+session.getPlayer().name+'\'s turn ~~');
    },
});
domain.assign('com.example.EnergyHealAction', {
    run: function(action) {
        var energy = action.entity.components['com.example.EnergyComponent'];
        console.log('healed some energy, ',action.entity.components['com.example.PositionComponent']);
        action.result = {previous: energy.energy};
        energy.energy = energy.energyMax;
    },
    undo: function(action) {
        console.log('All right, all right. I\'ll undo it for you. okay?');
        var energy = action.entity.components['com.example.EnergyComponent'];
        energy.energy = action.result.previous;
        action.result = null;
    }
});
domain.assign('com.example.MoveAction', {
    run: function(action) {
        var position = action.entity.components['com.example.PositionComponent'];
        var movable = action.entity.components['com.example.MovableComponent'];
        var energy = action.entity.components['com.example.EnergyComponent'];
        if(!movable) {
            console.log('Do you want to move a rock? What?');
            return;
        }
        if(!energy) {
            console.log('You have no power here!');
            return;
        }
        if(!position) {
            console.log('Tried to move a entity without position?');
            return;
        }
        if(action.direction == null || !action.distance) {
            console.log('Arguments not specificed');
            return;
        }
        if(energy.energy < (movable.energy * action.distance)) {
            console.log('Not enough energy');
            return;
        }
        action.result = {previous: {x:position.x, y:position.y}};
        energy.energy -= movable.energy * action.distance;
        
        var prevTile = action.session.map.getTile(position);
        var newTile = prevTile.getRelative(action.direction, action.distance);
        prevTile.children.splice(prevTile.children.indexOf(action.entity), 1);
        newTile.children.push(action.entity);
        position.x = newTile.position.x;
        position.y = newTile.position.y;
        console.log('Moved entity: ', action.result.previous, position);
    }
})
;
domain.assign('com.example.TableFlipAction', {
    run: function(action) {
        console.log(action.player.name + ' has flipped the table!');
        action.result = true;
    },
    undo: function(action) {
        console.log('Nevermind.');
    }
});

console.log('Registered domains: \n',domain.keys());

var map = new Base.Map(10, 10);

var session = new Base.Session(true, map, domain);

// Spawn a player
var player = new Base.Player(null);
player.name = 'Localhost';

session.addPlayer(player);

session.addSystem('com.example.TurnNotiSystem');
session.addSystem('com.example.EnergySystem');

// Iterate by offset coord
for(var y = 0; y < map.height; ++y) {
    for(var x = 0; x < map.width; ++x) {
        var tile = map.getTileByOffset(new Base.Point(x, y));
        var entity = session.spawnEntity('com.example.GrassEntity');
        entity.components[positionComponent].x = tile.position.x;
        entity.components[positionComponent].y = tile.position.y;
        tile.children.push(entity);
    }
}

// Spawn a movable entity
var tile = map.getTileByOffset(new Base.Point(4, 4));
var unit = session.spawnEntity('com.example.UnitEntity');
unit.components['com.example.OwnerComponent'].player = player.id;
unit.components[positionComponent].x = tile.position.x;
unit.components[positionComponent].y = tile.position.y;
tile.children.push(unit);

// Start turn
session.next();

// As a player, I want to move my unit to LEFT.
var moveAction = new Base.Action('com.example.MoveAction', session, player, unit);
moveAction.direction = Base.Direction.LEFT;
moveAction.distance = 2;
session.runAction(moveAction);

// As a player, I want to move my unit to RIGHT.
var moveAction = new Base.Action('com.example.MoveAction', session, player, unit);
moveAction.direction = Base.Direction.RIGHT;
moveAction.distance = 2;
session.runAction(moveAction);

session.next();

// TABLE FLIP!
session.runAction(new Base.Action('com.example.TableFlipAction', session, player, null));
session.undoLastAction();

var moveAction = new Base.Action('com.example.MoveAction', session, player, unit);
moveAction.direction = Base.Direction.TOP_RIGHT;
moveAction.distance = 2;
session.runAction(moveAction);
