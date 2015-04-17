var HexagonMap = function(width, height) {
    //http://www.mattpalmerlee.com/2012/04/05/fun-with-hexagon-math-for-games/
    this.width = width|0;
    this.height = height|0;
    this.sideX = width/2;
    this.side = (height*2-Math.sqrt(height*height*4+12*(height*height+width*width)))/-6;
    this.sideY = Math.sqrt(this.side*this.side - this.sideX*this.sideX);
    this.sideX = this.sideX | 0;
    this.sideY = this.sideY | 0;
    this.side = this.side | 0;
}

var REGULAR_HEXAGON_RATIO = 2 / Math.sqrt(3);
var hexInf = new HexagonMap(80, REGULAR_HEXAGON_RATIO * 80);

/**
 * A class used to communicate with canvases and the game.
 * User should manually inject this class to the game.
 * It is not possible to use this class in Node.js server - you need
 * Canvas element and DOM to properly use it.
 * @param width {Number} - The width of the game container.
 * @param height {Number} - The height of the game container.
 * @param canvases {Array} - An array containing canvases shown in the game.
 */
function RendererSystem(width, height, canvases) {
  this.width = width;
  this.height = height;
  
  /*if(canvases.length < 3) {
    throw new Error('There should be at least 3 canvases in the array');
  }*/
  
  this.canvases = canvases;
  this.contextes = canvases.map(function(value) {
    return value.getContext('2d');
  });

  this.cache = {};
  
  this.started = false;
  this.cacheInvalidated = true;
  this.cameraMoved = true;
  
  this.cameraX = 0;
  this.cameraY = 0;
}

/**
 * Resizes its canvases and itself to specified size.
 * It should be called after resizing event, etc.
 * @param width {Number} - The width of the game container.
 * @param height {Number} - The height of the game container.
 */
RendererSystem.prototype.updateSize = function(width, height) {
  this.width = width;
  this.height = height;
  this.canvases.forEach(function(value) {
    value.width = width;
    value.height = height;
  });
  this.cameraMoved = true;
}

RendererSystem.prototype.setCameraPos = function(x, y) {
  this.cameraX = x;
  this.cameraY = y;
  this.cameraMoved = true;
}

RendererSystem.prototype.invalidateCache = function() {
  this.cacheInvalidated = true;
}

RendererSystem.prototype.onAddedToEngine = function(engine) {
  this.engine = engine;
  this.entityList = this.engine.getEntitiesFor(Package.ComponentGroup.createBuilder(this.engine)
    .contain(InfoComponent, PositionComponent).build());
}

RendererSystem.prototype.onInit = function(turn) {
  this.started = true;
}

RendererSystem.prototype.onAction = function(turn, action) {
  this.refreshEntityMap();
}

RendererSystem.prototype.refreshEntityMap = function() {
  var posSys = this.engine.getSystem(PositionSystem);
  var entities = this.spawnCache('entities',
    posSys.width * hexInf.width + hexInf.width / 2 + 4,
    posSys.height * (hexInf.height - hexInf.sideY) + hexInf.sideY + 4);
  if(this.entityList == null) return;
  this.entityList.forEach(function(entity) {
    var posComp = entity.get(PositionComponent);
    var offsetX = RendererSystem.toOffsetCoordX(posComp.x, posComp.y);
    var offsetY = posComp.y;
    var renderX = RendererSystem.toRenderX(offsetX, offsetY) + 2;
    var renderY = RendererSystem.toRenderY(offsetY, offsetY) + 2;
    entities.ctx.fillStyle = "#aaaaaa";
    entities.ctx.strokeStyle = "#666666";
    entities.ctx.lineWidth = 2;
    pathEntity(entities.ctx, renderX, renderY, entity, false);
    entities.ctx.fill();
    entities.ctx.stroke();
    // text
    entities.ctx.fillStyle = "#333333";
    entities.ctx.font = '14px NanumGothic';
    entities.ctx.textBaseline = "middle";
    var name = entity.get(InfoComponent).name;
    entities.ctx.fillText(name, renderX + hexInf.width/2 - entities.ctx.measureText(name).width/2, 
      renderY + hexInf.height / 2);
  });
  this.cameraMoved = true;
}

// legacy code, should be removed ASAP

function pathEntity(context, drawX, drawY, entity, rectangle) {
  context.beginPath();
  if(rectangle) {
    context.rect(drawX + 4, drawY + hexInf.height / 2 - hexInf.side / 2, hexInf.width - 8 , hexInf.side);
  } else {
    context.arc(drawX + hexInf.width / 2, drawY + hexInf.height / 2 , hexInf.width / 2 - 4, 0, 2 * Math.PI, false);
  }
  context.closePath();
}

// end of legacy code

RendererSystem.prototype.spawnCache = function(name, width, height) {
  if(this.cache[name] == null) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    this.cache[name] = {
      canvas: canvas,
      ctx: canvas.getContext('2d')
    };
    return this.cache[name];
  } else {
    var cacheObj = this.cache[name];
    cacheObj.canvas.width = width;
    cacheObj.canvas.height = height;
    return cacheObj;
  }
}

RendererSystem.prototype.generateCache = function() {
  var debugTile = this.spawnCache('debugTile', hexInf.width | 0 + 6, hexInf.height | 0 + 6);
  // Render debug tile
  debugTile.ctx.beginPath();
  debugTile.ctx.moveTo(2+hexInf.sideX, 2);
  debugTile.ctx.lineTo(2+hexInf.width, 2+hexInf.sideY);
  debugTile.ctx.lineTo(2+hexInf.width, 2+hexInf.sideY + hexInf.side);
  debugTile.ctx.lineTo(2+hexInf.sideX, 2+hexInf.sideY*2 + hexInf.side);
  debugTile.ctx.lineTo(2, 2+hexInf.sideY + hexInf.side);
  debugTile.ctx.lineTo(2, 2+hexInf.sideY);
  debugTile.ctx.closePath();
  debugTile.ctx.fillStyle = '#F0F0F0';
  debugTile.ctx.fill();
  debugTile.ctx.strokeStyle = "#999";
  debugTile.ctx.lineWidth = 1;
  debugTile.ctx.stroke();
  var posSys = this.engine.getSystem(PositionSystem);
  var ground = this.spawnCache('ground', 
    posSys.width * hexInf.width + hexInf.width / 2 + 4,
    posSys.height * (hexInf.height - hexInf.sideY) + hexInf.sideY + 4);
  for(var y = 0; y < posSys.height; ++y) {
    for(var x = 0; x < posSys.width; ++x) {
      var renderX = RendererSystem.toRenderX(x, y);
      var renderY = RendererSystem.toRenderY(x, y);
      // Simply 'paste' debug tile to the canvas
      ground.ctx.drawImage(debugTile.canvas, renderX, renderY);
    }
  }
}

RendererSystem.prototype.refreshCamera = function() {
  // snap camera pos
  var posSys = this.engine.getSystem(PositionSystem);
  var maxX = posSys.width * hexInf.width + hexInf.width / 2 + 4;
  var maxY = posSys.height * (hexInf.height - hexInf.sideY) + hexInf.sideY + 4;
  this.cameraX = Math.max(0, Math.min(maxX - this.width, this.cameraX));
  this.cameraY = Math.max(0, Math.min(maxY - this.height, this.cameraY));
  var groundContext = this.contextes[0];
  var groundCanvas = this.canvases[0];
  var ground = this.cache['ground'];
  groundContext.clearRect(0, 0, this.width, this.height);
  groundContext.drawImage(ground.canvas, this.cameraX, this.cameraY, this.width, this.height,
    0, 0, this.width, this.height);
  var entities = this.cache['entities'];
  groundContext.drawImage(entities.canvas, this.cameraX, this.cameraY, this.width, this.height,
    0, 0, this.width, this.height);
}

RendererSystem.prototype.render = function() {
  if(!this.started) return;
  if(this.cacheInvalidated) {
    this.generateCache();
    this.cacheInvalidated = false;
  }
  if(this.cameraMoved) {
    this.refreshCamera();
    this.cameraMoved = false;
  }
}

RendererSystem.toRenderX = function(x, y) {
  return x * hexInf.width + (hexInf.width / 2 * (y & 1));
}

RendererSystem.toRenderY = function(x, y) {
  return y * (hexInf.height - hexInf.sideY);
}

RendererSystem.toOffsetCoordX = function(x, y) {
  return x + (y/2 | 0);
}

RendererSystem.toAxialCoordX = function(x, y) {
  return x - (y/2 | 0);
}
