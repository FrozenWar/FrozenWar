import {System, Component, Action} from 'ecstasy';
import {PositionComponent} from './position.js';

export class MoveComponent extends Component {
  constructor(options) {
    super();
    /**
     * Stores maximum distance of the Entity can move in a turn.
     * @var {Number}
     */
    this.maxStep = options.maxStep;
    /**
     * Stores current left distance of the Entity.
     * @var {Number}
     */
    this.step = 0;
  }
  /**
   * Checks if the Entity has a distance left.
   * @returns {Boolean} Whether if the Entity can move.
   */
  canMove() {
    return this.step > 0;
  }
  /**
   * Checks if the Entity has moved in this turn.
   * @returns {Boolean} Whether if the Entity has moved in the turn.
   */
  hasMoved() {
    return this.step !== this.maxStep;
  }
  /**
   * Heals the Entity's distance limit.
   */
  heal() {
    this.step = this.maxStep;
  }
  static get key() {
    return 'move';
  }
}

/**
 * Heals Entity's distance limit each turn.
 * @constructor
 * @extends TurnSystem
 */
export class MoveHealSystem extends System {
  add(engine) {
    this.engine = engine;
    this.entities = engine.e('move');
  }
  sequence() {
    this.entities.forEach(entity => entity.c('move').heal());
  }
  static get key() {
    return 'move';
  }
}

/**
 * Represents an Entity moving to specific position.
 * @constructor
 * @extends Action
 * @param engine {Engine} - The engine.
 * @param entity {Entity} - The entity to move.
 * @param player {Entity} - The player who initiated this action.
 * @param options {PositionComponent} - The point to move the entity.
 * @throws if Entity is out of distance limit
 * @throws if Entity does not have PositionComponent
 */
export class MoveAction extends Action {
  constructor(engine, entity, player, options) {
    super(engine, entity, player, options);
    if (options == null) throw new Error('Options should be a position');
    this.options = new PositionComponent(options);
  }
  run(engine) {
    let from = this.entity.c('pos');
    let move = this.entity.c('move');
    let cost = from.distance(this.options);
    if (cost > move.step) {
      throw new Error('That position is not reachable');
    }
    this.result = {
      x: from.x,
      y: from.y
    };
    move.step -= cost;
    from.x = this.options.x;
    from.y = this.options.y;
    engine.s('pos').updateEntity(this.entity);
  }
  static get key() {
    return 'move';
  }
  static get depends() {
    return ['pos', 'move'];
  }
}
