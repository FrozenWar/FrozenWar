var System = require('./System.js');

/**
 * Represents a System for a turn based game.
 * TurnSystem manages TurnEngine's Entity by its own method.
 * @constructor
 * @extends System
 * @see Entity
 */
function TurnSystem() {
  System.call(this);
}

TurnSystem.prototype = Object.create(System.prototype);
TurnSystem.prototype.constructor = TurnSystem;

/**
 * Called when the game starts.
 * @param turn {Turn} - The current Turn.
 */
TurnSystem.prototype.onInit = function(turn) {
  
}

/**
 * Called when the turn changes.
 * @param turn {Turn} - The current Turn.
 */
TurnSystem.prototype.onTurn = function(turn) {
  
}

/**
 * Called when the sequence id changes.
 * @param turn {Turn} - The current Turn.
 */
TurnSystem.prototype.onSequence = function(turn) {
  
}

/**
 * Called when the action runs.
 * @param turn {Turn} - The current Turn.
 * @param action {Action} - The action that has run.
 */
TurnSystem.prototype.onAction = function(turn, action) {
  
}

if(typeof module != 'undefined') {
  module.exports = TurnSystem;
}
