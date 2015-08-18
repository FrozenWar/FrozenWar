import {Action, System, Component} from 'ecstasy';

/**
 * Stores general information about the Entity.
 * It stores name, and type and tribe information.
 * @constructor
 * @extends Component
 * @param options {Object} - The object holding following parameters.
 * @param options.type {String} - The type of the Entity.
 * @param options.name {String} - The name of the Entity.
 * @param options.tribe {String} - The tribe of the Entity.
 */
export class InfoComponent extends Component {
  constructor(options) {
    super();
    /**
     * The type of the entity.
     * @type {String}
     */
    this.type = options.type;
    /**
     * The name of the entity.
     * @type {String}
     */
    this.name = options.name;
    /**
     * The tribe of the entity.
     * @type {String}
     */
    this.tribe = options.tribe;
  }
  static get key() {
    return 'info';
  }
}

/**
 * Stores owner of the Entity.
 * @constructor
 * @extends Component
 * @param options {Object} - The object holding following parameters.
 * @param options.id {Number} - The player Entity's id.
 */
export class OwnerComponent extends Component {
  constructor(options) {
    super();
    /**
     * The player entitiy's id.
     * @type {Number}
     */
    this.id = options.id;
  }
  getPlayer(engine) {
    return engine.e(this.id);
  }
  static get key() {
    return 'owner';
  }
}

/**
 * Checks actions sent by players and disallows if player is accessing other
 * player's Entity.
 */
export class OwnerSystem extends System {
  add(engine) {
    this.engine = engine;
  }
  preAction(turn, action) {
    // Server should filter out 'null' player action request.
    if (action.player == null) return;
    if (turn.player !== action.player) {
      throw new Error('It\'s not your turn yet');
    }
    if (action.entity == null) return;
    if (action.entity.c('owner')) {
      if (action.entity.c('owner').id !== action.player.id) {
        throw new Error('It\'s not your entity');
      }
    } else {
      // Normally users shouldn't run action on those entities
      throw new Error('Operation not permitted');
    }
  }
  static get key() {
    return 'owner';
  }
}

/**
 * Implements changing an Entity's owner.
 * This wouldn't be used in production game; This is for debugging.
 * @constructor
 * @extends Action
 * @param engine {Engine} - The engine.
 * @param entity {Entity} - The entity to move.
 * @param player {Entity} - The player who initiated this action.
 */
export class TransferOwnershipAction extends Action {
  run() {
    if (this.entity.c('owner').id !== this.player.id) {
      throw new Error('Entity\'s owner is not that player');
    }
    this.entity.c('owner').id = this.target.id;
    this.result = true;
  }
  static get key() {
    return 'transferOwnership';
  }
  static get depends() {
    return ['owner'];
  }
}
