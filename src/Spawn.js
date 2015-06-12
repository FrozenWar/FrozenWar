var Action = require('ecstasy').Action;
var EntityBuilder = require('ecstasy').EntityBuilder;
var Template = require('./EntityTemplate');

var SpawnAction = Action.scaffold(function(engine) {
  if(this.player != null) throw new Error('Players cannot run this action');
  var template = EntityBuilder.getEntityTemplate(this.options.type, Template);
  var entity = EntityBuilder.buildEntity(engine, template);
  if(entity.c('owner')) {
    entity.c('owner').id = this.options.player;
  }
  if(entity.c('position')) {
    if(this.options.x != null && this.options.y != null) {
      entity.c('position').x = this.options.x;
      entity.c('position').y = this.options.y;
    }
  }
  engine.addEntity(entity);
  this.result = entity.id;
  //engine.getSystem(Package.PositionSystem).addEntity(entity);
});

module.exports = function(engine) {
  engine.a('spawn', SpawnAction);
}
