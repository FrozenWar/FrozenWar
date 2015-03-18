/**
 * Stores general information about the Entity.
 * It stores name, and type and tribe information.
 * @constructor
 * @extends Component
 * @param type {String} - The type of the Entity.
 * @param name {String} - The name of the Entity.
 * @param tribe {String} - The tribe of the Entity.
 */
function InfoComponent(type, name, tribe) {
  /**
   * The type of the Entity.
   * @var {String}
   */
  this.type = type;
  /**
   * The name of the Entity.
   * @var {String}
   */
  this.name = name;
  /**
   * The tribe of the Entity.
   * @var {String}
   */
  this.tribe = tribe;
}

/**
 * Stores owner of the Entity.
 * @constructor
 * @extends Component
 * @param id {Number} - The player Entity's id.
 */
function OwnerComponent(id) {
  /**
   * The player Entity's id.
   * @var {Number}
   */
  this.id = id;
}

/**
 * Returns the owner player of the Entity.
 * @returns {Entity} the player Entity.
 */
OwnerComponent.prototype.getPlayer = function(engine) {
  return engine.getEntity(this.id);
}

/**
 * Checks actions sent by players and disallows if player is accessing other
 * player's Entity.
 * @constructor
 * @extends TurnSystem
 */
function OwnerSystem() {
  this.engine = null;
}

OwnerSystem.prototype.onAddedToEngine = function(engine) {
  this.engine = engine;
}

OwnerSystem.prototype.onPreAction = function(turn, action) {
  // Server should filter out 'null' player action request.
  if(action.player == null) return;
  if(turn.player != action.player) {
    throw new Error('It\'s not your turn yet');
  }
  if(action.entity.has(OwnerComponent)) {
    if(action.entity.get(OwnerComponent).id != action.player.id) {
      throw new Error('It\'s not your entity');
    }
  } else {
    // Normally users shouldn't run action on those entities
    throw new Error('Operation not permitted');
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
var TransferOwnershipAction = Package.Action.scaffold(function(engine) {
  if(!this.entity.has(OwnerComponent)) {
    throw new Error('Entity does not have OwnerComponent');
  }
  if(this.entity.get(OwnerComponent).id != this.player.id) {
    throw new Error('Entity\'s owner is not that player');
  }
  this.entity.get(OwnerComponent).id = this.target.id;
  this.result = true;
});

Package.InfoComponent = InfoComponent;
Package.OwnerComponent = OwnerComponent;
Package.OwnerSystem = OwnerSystem;
Package.TransferOwnershipAction = TransferOwnershipAction;
