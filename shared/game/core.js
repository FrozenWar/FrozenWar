domain.assign('posComp', {x: 0, y: 0});

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
