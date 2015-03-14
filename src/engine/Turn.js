
function Turn(id, order, seqId, player) {
  this.id = id;
  this.order = order;
  this.seqId = seqId;
  this.player = player;
  this.actions = [];
}

Turn.prototype.addAction = function(action) {
  this.actions.push(action);
}

if(typeof module != 'undefined') {
  module.exports = Turn;
}
