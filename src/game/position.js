import {System, Component} from 'ecstasy';
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
export class PositionComponent extends Component {
  constructor(options) {
    super();
    this.x = options.x;
    this.y = options.y;
  }
  /**
   * Returns Y value of the position.
   * Since axial coordinates is cube coordinates without Y axis,
   * We can simply get Y value with some calculation.
   * Note that actually z value is the Y value of the position.
   * @returns {Number} The Y value of the position
   */
  getZ() {
    return -this.x - this.y;
  }
  /**
   * Returns distance between two positions.
   * @param pos {PositionComponent} - The other position
   * @returns {Number} distance between two positions
   */
  distance(other) {
    return Math.max(Math.abs(other.x - this.x), Math.abs(other.getZ() -
      this.getZ()), Math.abs(other.y - this.y));
  }
  static get key() {
    return 'pos';
  }
}

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
export class PositionSystem extends System {
  constructor(width, height) {
    super();
    this.engine = null;
    this.entities = null;
    this.width = width || 20;
    this.height = height || 20;
    this.clear();
  }
  /**
   * Clears index array.
   * Normally this shouldn't be called externally, As this will clear the whole
   * index. This is only used in initalization and removal.
   */
  clear() {
    this.map = [];
    this.reverseMap = {};
    for (let y = 0; y < this.height; ++y) {
      this.map.push([]);
      for (let x = 0; x < this.width; ++x) {
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
  get(x, y) {
    // Return null if it's out of range.
    if (x + (y / 2 | 0) < 0 || x + (y / 2 | 0) > this.width) return null;
    if (y < 0 || y > this.height) return null;
    return this.map[y][x + (y / 2 | 0)];
  }
  /**
   * Removes an Entity from its indexed array.
   * @param entity {Entity} - The entity to remove
   */
  removeEntity(entity) {
    var tile = this.reverseMap[entity.id];
    if (!tile) return;
    tile.splice(tile.indexOf(entity), 1);
  }
  /**
   * Inserts an Entity from its indexed array.
   * @param entity {Entity} - The entity to insert
   * @throws An error if the entity doesn't have a {@link PositionComponent}
   */
  insertEntity(entity) {
    var posComp = entity.get('pos');
    if (!posComp) throw new Error('Entity does not have PositionComponent');
    var tile = this.get(posComp.x, posComp.y);
    if (tile == null) {
      throw new Error('Entity out of bounds');
    }
    tile.push(entity);
    this.reverseMap[entity.id] = tile;
  }
  add(engine) {
    this.engine = engine;
    this.entities = engine.e('pos');
    this.entities.forEach(entity => this.insertEntity(entity));
    let posGroup = engine.getComponentGroup(this.entities);
    this.entityAddHandler = this.insertEntity.bind(this);
    this.entityRemoveHandler = this.removeEntity.bind(this);
    posGroup.on('entityAdded', this.entityAddHandler);
    posGroup.on('entityRemoved', this.entityRemoveHandler);
  }
  remove(engine) {
    let posGroup = engine.getComponentGroup(this.entities);
    posGroup.removeListener('entityAdded', this.entityAddHandler);
    posGroup.removeListener('entityRemoved', this.entityRemoveHandler);
    this.engine = null;
    this.entities = null;
    this.clear();
  }
  /**
 * Reindexes an Entity to valid position.
 * You need to call this method after editing Entity's position.
 * @param entity {Entity} - The entity to reindex
 */
  updateEntity(entity) {
    this.removeEntity(entity);
    this.addEntity(entity);
  }
  // TODO Used to check errors, should be removed in production state
  action() {
    this.entities.forEach(entity => {
      var tile = self.reverseMap[entity.id];
      var posComp = entity.get('pos');
      var tile2 = self.get(posComp.x, posComp.y);
      if (tile !== tile2) {
        console.log(posComp.x, posComp.y);
        console.log('reverse', tile, 'current', tile2);
        throw new Error('Entity did not notify its position to PositionSystem');
      }
    });
  }
  static get key() {
    return 'pos';
  }
}
