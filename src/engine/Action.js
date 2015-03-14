/**
 * Represents each action taken by a player.
 * @constructor
 * @param {Engine} engine - The game engine associated with the action.
 * @param {Entity} entity - The entity associated with the action.
 * @param {Player} player - The player associated with the action.
 * @param {Entity} target - The target entity associated with the action.
 */
function Action(engine, entity, player, target) {
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
   * The player associated with the action.
   * @var {Entity}
   */
  this.player = player;
  /**
   * The target entity associated with the action.
   * @var {Entity}
   */
  this.target = target;
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
 * @param {Function} [classObj=Action] - The class to extend from.
 * @returns {Action}  A new class that has specified function and class.
 */
Action.scaffold = function(func, classObj) {
  classObj = classObj || Action;
  var newClass = function(engine, entity, player) {
    classObj.call(this, engine, entity, player);
  }
  newClass.prototype = Object.create(classObj.prototype);
  newClass.prototype.constructor = classObj;
  newClass.prototype.run = func;
  return newClass;
}

if(typeof module != 'undefined') {
  module.exports = Action;
}
