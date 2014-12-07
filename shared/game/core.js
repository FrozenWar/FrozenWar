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
            console.log('I am server!');
        } else {
            console.log('I am client!');
        }
    },
    turn: function(session) {
        console.log('turn');
    },
    all: function(session) {
        console.log('all');
    },
});
