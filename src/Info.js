var Action = require('ecstasy').Action;

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
function InfoComponent(options) {
  /**
   * The type of the Entity.
   * @var {String}
   */
  this.type = options.type;
  /**
   * The name of the Entity.
   * @var {String}
   */
  this.name = options.name;
  /**
   * The tribe of the Entity.
   * @var {String}
   */
  this.tribe = options.tribe;
}

/**
 * Stores owner of the Entity.
 * @constructor
 * @extends Component
 * @param options {Object} - The object holding following parameters.
 * @param options.id {Number} - The player Entity's id.
 */
function OwnerComponent(options) {
  /**
   * The player Entity's id.
   * @var {Number}
   */
  this.id = options.id;
}

/**
 * Returns the owner player of the Entity.
 * @returns {Entity} the player Entity.
 */
OwnerComponent.prototype.getPlayer = function(engine) {
  return engine.e(this.id);
}

/**
 * Checks actions sent by players and disallows if player is accessing other
 * player's Entity.
 */
var OwnerSystem = {
  add: function(engine) {
    this.engine = engine;
  },
  preAction: function(turn, action) {
    // Server should filter out 'null' player action request.
    if(action.player == null) return;
    if(turn.player != action.player) {
      throw new Error('It\'s not your turn yet');
    }
    if(action.entity.c('owner')) {
      if(action.entity.c('owner').id != action.player.id) {
        throw new Error('It\'s not your entity');
      }
    } else {
      // Normally users shouldn't run action on those entities
      throw new Error('Operation not permitted');
    }
  }
}

/**
 * Represents of changing an Entity's owner.
 * This wouldn't be used in production game; This is for debugging.
 * @constructor
 * @extends Action
 * @param engine {Engine} - The engine.
 * @param entity {Entity} - The entity to move.
 * @param player {Entity} - The player who initiated this action.
 */
var TransferOwnershipAction = Action.scaffold(function(engine) {
  if(!this.entity.c('owner')) {
    throw new Error('Entity does not have owner Component');
  }
  if(this.entity.c('owner').id != this.player.id) {
    throw new Error('Entity\'s owner is not that player');
  }
  this.entity.c('owner').id = this.target.id;
  this.result = true;
});

module.exports = function(engine) {
  engine.c('info', InfoComponent);
  engine.c('owner', OwnerComponent);
  engine.s('owner', OwnerSystem);
  engine.a('transferOwnership', TransferOwnershipAction);
}
