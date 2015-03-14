var System = require('./System.js');

function TurnSystem() {
  System.call(this);
}

TurnSystem.prototype = Object.create(System.prototype);
TurnSystem.prototype.constructor = TurnSystem;

TurnSystem.prototype.onInit = function(turn) {
  
}

TurnSystem.prototype.onTurn = function(turn) {
  
}

TurnSystem.prototype.onSequence = function(turn) {
  
}

TurnSystem.prototype.onAction = function(turn, action) {
  
}

if(typeof module != 'undefined') {
  module.exports = TurnSystem;
}