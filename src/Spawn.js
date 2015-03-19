var SpawnAction = Package.Action.scaffold(function(engine) {
  if(this.player != null) throw new Error('Players cannot run this action');
  var template = Package.EntityBuilder.getEntityTemplate(this.options.type);
  var entity = Package.EntityBuilder.buildEntity(engine, template);
  if(entity.has(Package.components.OwnerComponent)) {
    entity.get(Package.components.OwnerComponent).id = this.options.player;
  }
  if(entity.has(Package.components.PositionComponent)) {
    if(this.options.x != null && this.options.y != null) {
      entity.get(Package.components.PositionComponent).x = this.options.x;
      entity.get(Package.components.PositionComponent).y = this.options.y;
    }
  }
  engine.addEntity(entity);
  this.result = entity.id;
});

Package.actions.SpawnAction = SpawnAction;
