// entry point

var logger, engine, renderer;

window.onload = function() {
  logger = new Logger(document.getElementById('game-play-chat'));
  logger.log('document is ready');
  var gameLoader = new Package.GameLoader(true, logger);
  gameLoader.addPlayer(0, 'Player 1');
  gameLoader.addPlayer(1, 'Player 2');
  gameLoader.addPlayer(2, 'Player 3');
  
  // 그냥 꺼내옴
  engine = gameLoader.engine;
  
  logger.log('preparing renderer');
  renderer = new RendererSystem(800, 600, [document.getElementById('canvas')]);
  engine.addSystem(renderer);
  engine.nextTurn();
  
  var viewPort = document.getElementById('canvas-viewport');
  
  renderer.updateSize(viewPort.offsetWidth, viewPort.offsetHeight);
  
  window.addEventListener('resize', function() {
    setTimeout(function() { 
      renderer.updateSize(viewPort.offsetWidth, viewPort.offsetHeight);
      renderer.render();
    }, 20);
  });
  
  var prevX = 0, prevY = 0;
  
  function handleMouseMove(e) {
    var diffX = e.pageX - prevX;
    var diffY = e.pageY - prevY;
    renderer.setCameraPos(renderer.cameraX - diffX, renderer.cameraY - diffY);
    prevX = e.pageX, prevY = e.pageY;
  }
  
  function handleMouseUp(e) {
    document.removeEventListener('mousemove', handleMouseMove);
    return true;
  }
  
  viewPort.addEventListener('mousedown', function(e) {
    prevX = e.pageX, prevY = e.pageY;
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    return true;
  });
  
  animationLoop(); 
}

function animationLoop() {
  window.requestAnimationFrame(animationLoop);
  renderer.render();
}