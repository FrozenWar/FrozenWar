var PlayerComponent = function(options) {
  this.name = options.name;
}

module.exports = function(engine) {
  engine.c('player', PlayerComponent);
}
