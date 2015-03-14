/**
 * Represents a turn in a turn based game.
 * @constructor
 * @param id {Number} - The turn's id.
 * @param order {Number} - The turn's player order.
 * @param seqId {Number} - The turn's sequence id.
 * @param player {Entity} - The player associated with the turn.
 */
function Turn(id, order, seqId, player) {
  /**
   * The turn's unique ID starting from 0.
   * @var {Number}
   */
  this.id = id;
  /**
   * The turn's player order, starting from 0, ends at number of players - 1.
   * @var {Number}
   */
  this.order = order;
  /**
   * The turn's sequence ID, starting from 0, increases by 1 when
   * player order resets to 0.
   * @var {Number}
   */
  this.seqId = seqId;
  /**
   * The turn's player, who is owner of the turn.
   * @var {Entity}
   */
  this.player = player;
  /**
   * The array of {@link Action} executed in this turn.
   * @var {Array}
   * @see Action
   */
  this.actions = [];
}

/**
 * Adds the Action to the Turn.
 * @param action {Action} - The Action to add.
 */
Turn.prototype.addAction = function(action) {
  this.actions.push(action);
}

if(typeof module != 'undefined') {
  module.exports = Turn;
}
