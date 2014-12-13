domain.assign('posComp', {x: 0, y: 0});
domain.assign('ownerComp', {player: -1});
domain.assign('actionComp', {actions: []});
domain.assign('tileComp', {type: 'grass', color: "#00ff00"});
domain.assign('renderComp', {name: 'null', color: '#000000', background: '#ffffff'});

domain.assign('unitEntity', {
    posComp: {},
    renderComp: {
        name: 'Unit',
        color: '#1E98D3',
        background: '#9EDBF9'
    },
    actionComp: {
        actions: ['infoAct']
    }
});


domain.assign('grassEntity', {
    posComp: {},
    tileComp: {
        type: 'grass',
        color: '#71CC66'
    }
});

domain.assign('spawnAct', {
    run: function(action) {
        
    },
    undo: function(action) {
        
    }
});

domain.assign('moveAct', {
    run: function(action) {
        
    },
    undo: function(action) {
    
    }
});

domain.assign('infoAct', {
    run: function(action) {
        logger.log(JSON.stringify(action.getEntity()));
        if(action.session.isServer) {
            action.result = true;
        }
    },
    undo: function(action) {
    
    }
});

domain.assign('sampleSys', {
    system: 0,
    order: function(session) {
    },
    init: function(session) {
        if(session.isServer) {
            logger.log('I am server!');
        } else {
            logger.log('I am client!');
        }
    },
    turn: function(session) {
        logger.info('New turn started');
    },
    all: function(session) {
    },
});

domain.assign('sampleAct', {
    run: function(action) {
        if(action.session.isServer) {
            action.result = Math.random()*6+1|0;
            logger.log('Rolled a dice: '+action.result);
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
