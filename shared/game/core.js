domain.assign('posComp', {x: 0, y: 0});
domain.assign('ownerComp', {player: -1});
domain.assign('actionComp', {actions: []});

domain.assign('sampleSys', {
    system: 0,
    order: function(session) {
        console.log('order');
        session.map.forEach(function(entity) {
            console.log('Hi entity '+entity.id);
        });
    },
    init: function(session) {
        console.log('init');
        if(session.isServer) {
            logger.log('I am server!');
        } else {
            logger.log('I am client!');
        }
    },
    turn: function(session) {
        console.log('turn');
    },
    all: function(session) {
        console.log('all');
    },
});

domain.assign('sampleAct', {
    run: function(action) {
        if(action.session.isServer) {
            console.log('I roll a dice.');
            action.result = Math.random()*6+1|0;
        } else {
            logger.log('Rolled a dice! It was '+action.result+'!');
        }
    },
    undo: function(action) {
        if(action.session.isServer) {
            // undo
            action.result = {};
        }
    }
});

domain.assign('moveLib', {
    move: function(entity, to) {
        var pos = entity.components['posComp'];
        if(!pos) {
            throw new Error('Tried to move entity that doesn\'t have position');
        }
        var tile = entity.session.map.getTile(pos);
        var newTile = entity.session.map.getTile(to);
        tile.children.splice(tile.children.indexOf(entity), 1);
        newTile.children.push(entity);
        pos.x = to.x;
        pos.y = to.y;
    }
});
