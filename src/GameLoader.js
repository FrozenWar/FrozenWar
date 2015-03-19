var GameLoader = function(isServer, logger) {
  this.engine = new Package.TurnEngine(isServer);
  logger && logger.log('searching package');
  for(var key in Package.components) {
    logger && logger.log('found component '+key);
    this.engine.registerComponent(Package.components[key]);
  }
  for(var key in Package.systems) {
    logger && logger.log('found system '+key);
    this.engine.addSystem(new Package.systems[key]());
  }
  for(var key in Package.actions) {
    logger && logger.log('found action '+key);
  }
  logger && logger.log('preparing session complete');
}

GameLoader.prototype.addPlayer = function(id, name) {
  logger && logger.log('adding player id='+id+',name='+name);
  var entity = new Package.Entity(this.engine);
  entity.add(new Package.components.PlayerComponent(id, name));
  this.engine.addEntity(entity);
  logger && logger.log('entity id='+entity.id+', componentBits='+entity.componentBits.toString());
}

Package.GameLoader = GameLoader;