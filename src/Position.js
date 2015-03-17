var ComponentGroup = require('./engine/ComponentGroup.js');

/**
 * Represents a position of an Entity.
 * This game uses hexagonal grids with axial coordinates for position system.
 * Note that actually y value is the Z value of the position.
 * @constructor
 * @extends Component
 * @param [x] {Number} - The X value of the position
 * @param [y] {Number} - The Z value of the position
 * @see http://www.redblobgames.com/grids/hexagons/
 */
function PositionComponent(x, y) {
  this.x = x || 0;
  this.y = y || 0;
}

/**
 * Returns Y value of the position.
 * Since axial coordinates is cube coordinates without Y axis,
 * We can simply get Y value with some calculation.
 * Note that actually z value is the Y value of the position.
 * @returns {Number} The Y value of the position
 */
PositionComponent.prototype.getZ = function() {
  return -this.x - this.y;
}

/**
 * Returns distance between two positions.
 * @param pos {PositionComponent} - The other position
 * @returns {Number} distance between two positions
 */
PositionComponent.prototype.distance = function(pos) {
  return Math.max(Math.abs(pos.x - this.x), Math.abs(pos.getZ() - this.getZ()),
    Math.abs(pos.y - this.y));
}

var Point = PositionComponent;

/**
 * Indexes Entity into 2 dimensional array.
 * This allows other System to find an Entity in specific location quickly.
 * To correctly index the Entity, Programs should notify the location update
 * to PositionSystem by {@link PositionSystem#updateEntity}.
 * If not, unexpected bugs can occur.
 * PositionSystem uses finite size 2 dimensional array.
 * Entity beyond map size will be ignored and won't be indexed in the system.
 * @constructor
 * @extends TurnSystem
 * @param width {Number} - The width of the map
 * @param height {Number} - The height of the map
 */
function PositionSystem(width, height) {
  this.engine = null;
  this.entities = null;
  this.width = width;
  this.height = height;
  this.clear();
}

/**
 * Clears index array.
 * Normally this shouldn't be called externally, As this will clear the whole
 * index. This is only used in initalization and removal.
 */
PositionSystem.prototype.clear = function() {
  this.map = [];
  this.reverseMap = {};
  for(var y = 0; y < this.height; ++y) {
    this.map.push([]);
    for(var x = 0; x < this.width; ++x) {
      this.map[y].push([]);
    }
  }
}

/**
 * Returns an array of Entity in specific location.
 * Note that the array shouldn't be edited, because system itself uses
 * that array instance for internal use.
 * @param x {Number} - The X position
 * @param y {Number} - The Y position
 * @returns {Array} An array holding list of Entity in specific location
 */
PositionSystem.prototype.get = function(x, y) {
  // Returns empty array if it's out of range.
  if(x < 0 || x > this.width || y < 0 || y > this.height) return [];
  return this.map[y][x];
}

/**
 * Removes an Entity from its indexed array.
 * @param entity {Entity} - The entity to remove
 * @private
 */
PositionSystem.prototype._removeEntity = function(entity) {
  var tile = this.reverseMap[entity];
  if(!tile) return;
  tile.splice(tile.indexOf(entity), 1);
}

/**
 * Inserts an Entity from its indexed array.
 * @param entity {Entity} - The entity to insert
 * @private
 * @throws An error if the entity doesn't have a {@link PositionComponent}
 */
PositionSystem.prototype._insertEntity = function(entity) {
  var posComp = entity.get(PositionComponent);
  if(!posComp) throw new Error('Entity does not have PositionComponent');
  var tile = this.get(posComp.x, posComp.y);
  tile.push(entity);
  this.reverseMap[entity] = tile;
}

PositionSystem.prototype.onAddedToEngine = function(engine) {
  this.engine = engine;
  this.entities = engine.getEntitiesFor(ComponentGroup.createBuilder(engine).
    contain(PositionComponent).build());
  this.entities.forEach(function(entity) {
    this._insertEntity(entity);
  });
  var posGroup = engine.getComponentGroup(this.entities);
  posGroup.on('entityAdded', this.onEntityAdded);
  posGroup.on('entityRemoved', this.onEntityRemoved);
}

PositionSystem.prototype.onRemovedFromEngine = function(engine) {
  var posGroup = engine.getComponentGroup(this.entities);
  posGroup.removeListener('entityAdded', this.onEntityAdded);
  posGroup.removeListener('entityRemoved', this.onEntityRemoved);
  this.engine = null;
  this.entities = null;
  this.clear();
}

PositionSystem.prototype.onEntityAdded = function(entity) {
  this._insertEntity(entity);
}

PositionSystem.prototype.onEntityRemoved = function(entity) {
  this._removeEntity(entity);
}

/**
 * Reindexes an Entity to valid position.
 * You need to call this method after editing Entity's position.
 * @param entity {Entity} - The entity to reindex
 */
PositionSystem.prototype.updateEntity = function(entity) {
  this._removeEntity(entity);
  this._insertEntity(entity);
}

// TODO Used to check errors, should be removed in production state
PositionSystem.prototype.onAction = function(turn, action) {
  this.entities.forEach(function(entity) {
    var tile = this.reverseMap[entity];
    var posComp = entity.get(PositionComponent);
    var tile2 = this.get(posComp.x, posComp.y);
    if(tile != tile2) {
      throw new Error('Entity did not notified its position to PositionSystem');
    }
  });
}

if(typeof module != 'undefined') {
  module.exports.PositionComponent = PositionComponent;
  module.exports.Point = Point;
  module.exports.PositionSystem = PositionSystem;
}
