/**
 * Represents a System for a turn based game.
 * TurnSystem manages TurnEngine's Entity by its own method.
 * @constructor
 * @extends System
 * @see Entity
 */
function TurnSystem() {
  Package.System.call(this);
}

TurnSystem.prototype = Object.create(Package.System.prototype);
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
 * Called when before action runs.
 * @param turn {Turn} - The current Turn.
 * @param action {Action} - The action about to run.
 */
TurnSystem.prototype.onPreAction = function(turn, action) {
  
}

/**
 * Called when the action runs.
 * @param turn {Turn} - The current Turn.
 * @param action {Action} - The action that has run.
 */
TurnSystem.prototype.onAction = function(turn, action) {
  
}

Package.TurnSystem = TurnSystem;
