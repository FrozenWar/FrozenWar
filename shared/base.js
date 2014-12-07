var Server = function() {
    this.session = null;
    this.clients = [];
};

var Client = function() {
    // TODO Possibly socket, etc
};

/**
 * Only server should create it without id.
 * Client should create it with given id, or it may conflict.
 **/

var Entity = function(session, id) {
    this.id = id;
    this.session = session;
    this.domain = '';
    this.components = {};
    if(this.id == null) {
        if(session.isServer) {
            // Request ID from the session
            this.id = session._entityCount;
            session._entityCount ++;
        } else {
            // Throw an exception
            throw new Error('Clients can\'t create Entity without given id');
        }
    }
};

Entity.prototype.serialize = function() {
    return {
        id: this.id,
        domain: this.domain,
        components: this.components
    };
}

Entity.prototype.addComponent = function(domain) {
    var component = {};
    var prototype = this.session.domain.get(domain);
    for(var i in prototype) {
        component[i] = prototype[i];
    }
    this.components[domain] = component;
    return component;
}

var Action = function(domain, session, player, entity, args) {
    this.domain = domain;
    this.session = session;
    this.player = player;
    this.entity = entity;
    this.args = args;
    this.result = null;
};

Action.prototype.serialize = function() {
    return {
        domain: this.domain,
        player: (this.player ? this.player.id : -1),
        entity: (this.entity ? this.entity.id : -1),
        args: this.args,
        result: this.result
    };
}

Action.prototype.getExec = function() {
    return this.session.domain.get(this.domain);
}

Action.prototype.run = function() {
    if(this.result != null) throw new Error('Action already has run.');
    var run = this.getExec();
    if(typeof(run) == 'function') {
        run(this);
    } else {
        run.run(this);
    }
}

Action.prototype.undo = function() {
    if(this.result == null) throw new Error('Action didn\'t run.');
    var undo = this.getExec().undo;
    if(undo && typeof(undo) == 'function') {
        undo(this);
    } else {
        throw new Error('Action doesn\'t support undo.');
    }
}

var Session = function(isServer, map, domain) {
    this.isServer = isServer;
    this.players = [];
    this.turns = [];
    this.map = map;
    this.domain = domain;
    this.systems = [];
    this._entityCount = 0;
    this._playerCount = 0;
    this.turnId = -1;
};

Session.prototype.spawnEntity = function(domain, id) {
    var entity = new Entity(this, id);
    entity.domain = domain;
    var prototype = this.domain.get(domain);
    // Extend domain's components first.
    Object.keys(prototype).forEach(function(value) {
        var component = entity.addComponent(value);
        for(var i in prototype[value]) {
            component[i] = prototype[value][i];
        }
    });
    return entity;
}

Session.prototype.runSystems = function(mode) {
    var self = this;
    for(var key in this.systems) {
        var system = this.systems[key];
        if(system[mode] && typeof(system[mode]) == 'function') system[mode](self);
        if(system['all'] && typeof(system['all']) == 'function') system['all'](self);
    }
}

Session.prototype.addSystem = function(domain) {
    var system = this.domain.get(domain);
    this.systems[domain] = system;
}

Session.prototype.addPlayer = function(player) {
    if(this.turnId >= 0) throw new Error('Players can only be added before starting turn');
    player.id = this._playerCount;
    this._playerCount ++;
    this.players.push(player);
}

Session.prototype.getTurn = function() {
    return this.turns[this.turns.length-1];
}

Session.prototype.nextTurn = function() {
    if(this.getTurn() && !this.getTurn().isFinished(this)) {
        throw new Error('There are some players left before calling nextTurn.');
    }
    this.turnId ++;
    var turn = new Turn(this.turnId);
    this.turns.push(turn);
    if(this.turnId == 0) {
        // Initial turn
        this.runSystems('init');
    }
    this.runSystems('turn');
    turn.order = 0;
    this.runSystems('order');
    return turn;
}

Session.prototype.next = function() {
    if(this.getTurn() && !this.getTurn().isFinished(this)) {
        this.getTurn().next(this);
        // TODO should I put this code?
        if(this.getTurn().isFinished(this)) {
            this.nextTurn();
        }
    } else {
        this.nextTurn();
    }
    return this.getTurn();
}

Session.prototype.runAction = function(action) {
    action.run();
    if(action.result != null) this.getTurn().actions.push(action);
}

Session.prototype.undoLastAction = function() {
    this.getTurn().actions.pop().undo();
}

Session.prototype.getPlayer = function() {
    return this.getTurn().getPlayer(this);
}

Session.prototype.serialize = function() {
    var self = this;
    return {
        players: (function() {
            var array = [];
            self.players.forEach(function(value) {
                array.push(value.serialize());
            });
            return array;
        })(),
        turns: (function() {
            var array = [];
            self.turns.forEach(function(value) {
                array.push(value.serialize());
            });
            return array;
        })(),
        map: this.map.serialize(),
        domain: this.domain.keys(),
        systems: Object.keys(this.systems),
        turnId: this.turnId
    };
}

var Player = function(client) {
    this.client = client;
    this.id = null;
    this.name = '';
    this.resources = [];
}

Player.prototype.serialize = function() {
    return {
        id: this.id,
        name: this.name,
        resources: this.resources
    };
}

var Turn = function(id) {
    this.id = id;
    this.order = -1;
    this.actions = [];
}

Turn.prototype.next = function(session) {
    if(this.isFinished(session)) {
        throw new Error('Turn is over. Call session.nextTurn instead.');
    }
    session.runSystems('order');
    this.order ++;
}

Turn.prototype.isFinished = function(session) {
    return session.players.length-1 <= this.order;
}

Turn.prototype.getPlayer = function(session) {
    return session.players[this.order];
}

Turn.prototype.serialize = function() {
    var array = [];
    this.actions.forEach(function(value) {
        array.push(value.serialize());
    });
    return array;
}

var Point = function(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype.multiply = function(r) {
    return new Point(this.x * r, this.y * r);
}

var Tile = function(position, map) {
    this.map = map;
    this.position = position;
    this.children = [];
}

/**
 * Returns a tile object by relative offset.
 * @param direction a String object, contains a key for map's direction.
 * @param distance distance between this tile and a tile.
 * @returns a tile object or null.
 **/
Tile.prototype.getRelative = function(direction, distance) {
    if(!distance) distance = 1;
    var dirPoint = this.map.direction[direction].multiply(distance);
    return this.map.getTile(new Point(this.position.x + dirPoint.x, this.position.y + dirPoint.y));
}

Tile.prototype.serialize = function() {
    var array = [];
    this.children.forEach(function(value) {
        array.push(value.serialize());
    });
    return array;
}

var Map = function(width, height) {
    this.session = null;
    this.width = width;
    this.height = height;
    // Init map object.
    // Note that this uses rectangle shaped map.
    this._data = [];
    for(var y = 0; y < height; ++y) {
        this._data[y] = [];
        for(var x = 0; x < width; ++x) {
            this._data[y][x] = new Tile(this.toAxialCoord(new Point(x, y)), this);
        }
    }
};

Map.prototype.searchEntity = function(id) {
    for(var y = 0; y < this.height; ++y) {
        for(var x = 0; x < this.width; ++x) {
            var tile = this._data[y][x];
            for(var i = 0; i < tile.children.length; ++i) {
                if(tile.children[i].id == id) return tile.children[i];
            }
        }
    }
    return null;
}

/**
 * Returns a tile object by axial coordinate.
 * @param point the point object containing axial coordinate.
 * @returns a tile object or null.
 **/
Map.prototype.getTile = function(point) {
    return this.getTileByOffset(this.toOffsetCoord(point));
}

/**
 * Returns a tile object by offset coordinate.
 * @param point the point object containing offset coordinate.
 * @returns a tile object or null.
 **/
Map.prototype.getTileByOffset = function(point) {
    // We still have to check y in js
    if(point.y < 0 || point.y >= this.height) return null;
    return this._data[point.y][point.x];
}

/**
 * Translates axial coordinate to offset coordinate.
 * It shouldn't be used in the game, It should be used by Map object itself.
 * @param point the point object containing axial coordinate.
 * @returns a point object containing offset coordinate.
 **/
Map.prototype.toOffsetCoord = function(point) {
    return new Point(point.x + (point.y/2 | 0), point.y);
}

/**
 * Translates offset coordinate to axial coordinate.
 * It shouldn't be used in the game, It should be used by Map object itself.
 * @param point the point object containing offset coordinate.
 * @returns a point object containing axial coordinate.
 **/
Map.prototype.toAxialCoord = function(point) {
    return new Point(point.x - (point.y/2 | 0), point.y);
}

Map.prototype.forEach = function(callback) {
    for(var y = 0; y < this.height; ++y) {
        for(var x = 0; x < this.width; ++x) {
            this._data[y][x].children.forEach(callback);
        }
    }
}

Map.prototype.serialize = function() {
    var array = [];
    for(var y = 0; y < this.height; ++y) {
        for(var x = 0; x < this.width; ++x) {
            array = array.concat(this._data[y][x].serialize());
        }
    }
    return {width: this.width, height: this.height, entities: array};
}

var Direction = {
    TOP_LEFT: 'topleft',
    LEFT: 'left',
    BOTTOM_LEFT: 'bottomleft',
    TOP_RIGHT: 'topright',
    RIGHT: 'right',
    BOTTOM_RIGHT: 'bottomright'
};

Map.prototype.direction = {
    topleft: new Point(0, -1),
    left: new Point(-1, 0),
    bottomleft: new Point(-1, 1),
    topright: new Point(1, -1),
    right: new Point(1, 0),
    bottomright: new Point(0, 1)
};

var Domain = function() {
    this.table = [];
}

Domain.prototype.assign = function(domain, object) {
    this.table[domain] = object;
}

Domain.prototype.get = function(domain) {
    return this.table[domain];
}

Domain.prototype.keys = function() {
    return Object.keys(this.table);
}

if(module && module.exports) {
    module.exports.Server = Server;
    module.exports.Client = Client;
    module.exports.Entity = Entity;
    module.exports.Action = Action;
    module.exports.Session = Session;
    module.exports.Player = Player;
    module.exports.Turn = Turn;
    module.exports.Point = Point;
    module.exports.Tile = Tile;
    module.exports.Map = Map;
    module.exports.Direction = Direction;
    module.exports.Domain = Domain;
}
