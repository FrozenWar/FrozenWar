/**
 * Represents each action taken by a player.
 * @constructor
 * @param {Engine} engine - The game engine associated with the action.
 * @param {Entity} entity - The entity associated with the action.
 * @param {Entity} player - The player who requested the action.
 * @param {Object} options - The arguments associated with the action.
 */
function Action(engine, entity, player, options) {
  /**
   * The game engine associated with the action.
   * @var {Engine}
   */
  this.engine = engine;
  /**
   * The entity associated with the action.
   * @var {Entity}
   */
  this.entity = entity;
  /**
   * The player who requested the action.
   * Note that a player is an entity with a player component.
   * It defaults to {@link PlayerComponent}, 
   * but it can be changed by {@link TurnEngine}.
   * @var {Entity}
   */
  this.player = player;
  /**
   * The arguments associated with the action.
   * @var {Object}
   */
  this.options = options;
  /**
   * The result of the action.
   * It should be null if it hasn't run yet.
   * @var {Object}
   */
  this.result = null;
}

/**
 * Runs the action and applies changes to the engine.
 * @param {Engine} engine - The game engine to assign.
 * @throws Will throw an error if {@link action#run} is not implemented.
 */
Action.prototype.run = function(engine) {
  throw new Error('Action.run is not implemented');
}

/**
 * Creates a new Action class that has given function as {@link Action#run}.
 * @static
 * @param {Function} func - The function to use as {@link Action#run}.
 * @param {Function} constructor - The function to use as constructor.
 * @param {Function} [classObj=Action] - The class to extend from.
 * @returns {Action}  A new class that has specified function and class.
 */
Action.scaffold = function(func, constructor, classObj) {
  classObj = classObj || Action;
  var newClass = function(engine, entity, player, options) {
    classObj.call(this, engine, entity, player, options);
    if(constructor) {
      constructor.call(this, engine, entity, player, options);
    }
  }
  newClass.prototype = Object.create(classObj.prototype);
  newClass.prototype.constructor = classObj;
  newClass.prototype.run = func;
  return newClass;
}

Package.Action = Action;
