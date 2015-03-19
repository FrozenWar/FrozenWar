// entry point

var logger, engine;

window.onload = function() {
  logger = new Logger();
  logger.log('document is ready');
  var gameLoader = new Package.GameLoader(true, logger);
  gameLoader.addPlayer(0, 'Player 1');
  gameLoader.addPlayer(1, 'Player 2');
  gameLoader.addPlayer(2, 'Player 3');
  
  // 그냥 꺼내옴
  engine = gameLoader.engine;
  updateTileMap();
}
