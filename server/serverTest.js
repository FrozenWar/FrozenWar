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
domain.assign('com.example.RenderComponent', {
    sprite: null, x: 0, y: 0
});
domain.assign('com.example.TileEntity', {
    'com.example.PositionComponent': {},
    'com.example.TileComponent': {},
    'com.example.RenderComponent': {
        sprite: 'com.example.assets.VoidSprite'
    },
});

console.log('Registered domains: \n',domain.keys());

var map = new Base.Map(10, 10);

var session = new Base.Session(true, map, domain);

// Iterate by offset coord
for(var y = 0; y < map.height; ++y) {
    for(var x = 0; x < map.width; ++x) {
        var tile = map.getTileByOffset(new Base.Point(x, y));
        var entity = session.spawnEntity('com.example.TileEntity');
        entity.components[positionComponent].x = tile.position.x;
        entity.components[positionComponent].y = tile.position.y;
        tile.children.push(entity);
    }
}

//Yay.
console.log(JSON.stringify(map.serialize(), undefined, 2));
