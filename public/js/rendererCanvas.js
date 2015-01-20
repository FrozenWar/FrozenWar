function updateMap() {
  updateTileMap();
  updateUnitMap();
}

var highlights = [];
var Highlight = function(x, y, range, color) {
  this.x = x;
  this.y = y;
  this.range = range|0;
  this.color = color;
}
Highlight.prototype.forEach = function(callback) {
  for(var x = -this.range; x <= this.range; ++x) {
    for(var y = Math.max(-x-this.range, -this.range); y <= Math.min(this.range, -x+this.range); ++y) {
      var z = -x-y;
      callback(x+this.x, y+this.y, z);
    }
  }
}

var highlightDiff = false;
var highlightsBefore = [];

function resetHighlight() {
  highlightDiff = false;
  var highlight;
  while(highlight = highlights.pop()) {
    highlight.forEach(function(x, y) {
      var tile = session.map.getTile(new Point(x, y));
      if(!tile) return;
      if(tile.background == null) return;
      tile.background = null;
      tile.valid = false;
    });
  }
}
function setHighlight(highlight) {
  highlight.range = Math.min(Math.max(session.map.width, session.map.height), highlight.range);
  for(var i = 0; i < highlights.length; ++i) {
    var item = highlights[i];
    if(item.x != highlight.x) continue;
    if(item.y != highlight.y) continue;
    if(item.range != highlight.range) continue;
    if(item.color != highlight.color) continue;
    return;
  }
  //if(highlight.range > 5) return;
  highlights.push(highlight);
  highlightDiff = true;
}
function applyHighlight() {
  highlightDiff = false;
  // disable highlights
  highlightsBefore.forEach(function(highlight) {
    for(var i = 0; i < highlights.length; ++i) {
      var item = highlights[i];
      if(item.x != highlight.x) continue;
      if(item.y != highlight.y) continue;
      if(item.range != highlight.range) continue;
      if(item.color != highlight.color) continue;
      return;
    }
    // Destroy it
    highlight.forEach(function(x, y) {
      var tile = session.map.getTile(new Point(x, y));
      if(!tile) return;
      if(tile.background == null) return;
      tile.background = null;
      tile.valid = false;
    });
  });
  // Sort them first
  highlights.sort(function(a, b) {
    return b.range - a.range;
  });
  highlights.forEach(function(highlight) {
    highlight.forEach(function(x, y) {
      var tile = session.map.getTile(new Point(x, y));
      if(!tile) return;
      if(tile.background == highlight.color) return;
      tile.background = highlight.color;
      tile.valid = false;
    });
  });
  highlightsBefore = highlights;
}

function getRenderX(point) {
  return point.x * hexInf.width + (hexInf.width / 2 * (point.y&1)) + 2;
}

function getRenderY(point) {
  return point.y * (hexInf.height-hexInf.sideY) + 2;
}

var validCanvas = true;

function updateTileMap() {
  applyHighlight();
  var canvas = document.getElementById('tileCanvas');
  if(!validCanvas) {
    canvas.width = session.map.width * hexInf.width + hexInf.width / 2 + 4;
    canvas.height = session.map.height * (hexInf.height-hexInf.sideY) + hexInf.sideY + 4;
  }
  var context = canvas.getContext('2d');
  // context.clearRect(0, 0, canvas.width, canvas.height);
  session.map.forEachTile(function(tile) {
    if(!tile.valid) {
      tile.valid = true;
      var offsetPos = session.map.toOffsetCoord(tile.position);
      var drawX = getRenderX(offsetPos);
      var drawY = getRenderY(offsetPos);
      // tile
      context.beginPath();
      context.moveTo(drawX + hexInf.sideX, drawY);
      context.lineTo(drawX + hexInf.width, drawY + hexInf.sideY);
      context.lineTo(drawX + hexInf.width, drawY + hexInf.sideY + hexInf.side);
      context.lineTo(drawX + hexInf.sideX, drawY + hexInf.sideY*2 + hexInf.side);
      context.lineTo(drawX, drawY + hexInf.sideY + hexInf.side);
      context.lineTo(drawX, drawY + hexInf.sideY);
      context.closePath();
      // fill
      context.fillStyle = '#F0F0F0';
      if(tile.background) context.fillStyle = tile.background;
      context.fill();
      // border
      context.strokeStyle = "#999";
      context.lineWidth = 1;
      context.stroke();
      // pos
      context.fillStyle = '#000000';
      context.font = '14px NanumGothic';
      context.textBaseline = "middle";
      var name = tile.position.x + ',' +tile.position.y;
      context.fillText(name, drawX + hexInf.width/2 - context.measureText(name).width/2, 
          drawY + hexInf.height / 2);
    }
  });
}

function updateUnitMap() {
  var canvas = document.getElementById('unitCanvas');
  if(!validCanvas) {
    canvas.width = session.map.width * hexInf.width + hexInf.width / 2 + 4;
    canvas.height = session.map.height * (hexInf.height-hexInf.sideY) + hexInf.sideY + 4;
    validCanvas = true;
  }
  var context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height); // Unit map needs reset.
  // entity
  session.map.forEach(function(entity, tile) {
    if(!(entity.get('Cbuilding') || entity.get('Cunit'))) return;
    var offsetPos = session.map.toOffsetCoord(tile.position);
    var drawX = getRenderX(offsetPos);
    var drawY = getRenderY(offsetPos);
    // fly
    if(entity.get('Cfly') && entity.get('Cfly').fly) {
      pathEntity(context, drawX, drawY, entity, entity.get('Cbuilding'));
      context.fillStyle = 'rgba(0, 0, 0, 0.5)';
      context.fill();
      drawX -= 6;
      drawY -= 6;
    }
    // fill
    pathEntity(context, drawX, drawY, entity, entity.get('Cbuilding'));
    context.fillStyle = getColorIdent(colors.background, session, entity);
    context.strokeStyle = getColorIdent(colors.border, session, entity);
    if(entity == menuEntity) {
      context.fillStyle = '#FFFFFF';
    }
    if(entity == selectedEntity) {
      context.strokeStyle = '#FFFFFF';
    }
    context.lineWidth = 2;
    context.fill();
    context.stroke();
    // text
    context.fillStyle = getColorIdent(colors.text, session, entity);
    context.font = '14px NanumGothic';
    context.textBaseline = "middle";
    var name = '';
    if(entity.get('Cbuilding')) {
      name = getName(entity.get('Cbuilding'));
    } else {
      name = getName(entity.get('Cunit'));
    }
    context.fillText(name, drawX + hexInf.width/2 - context.measureText(name).width/2, 
      drawY + hexInf.height / 2);
    // bars
    var barOffset = 0;
    if(entity.get('Cdamage')) {
      var color = entity.get('Cdamage').fortify ? '#ff0' : '#f00';
      var percent = (entity.get('Cdamage').health / entity.get('Cdamage').maxHealth);
      drawStatusBar(context, drawX, drawY, barOffset, percent, '#999', color);
      barOffset ++;
    }
    if(entity.get('Cpower')) {
      var percent = (entity.get('Cpower').power / entity.get('Cpower').maxPower);
      drawStatusBar(context, drawX, drawY, barOffset, percent, '#999', '#00f');
      barOffset ++;
    }
    if(entity.get('Cmove')) {
      var percent = (entity.get('Cmove').move / entity.get('Cmove').maxMove);
      drawStatusBar(context, drawX, drawY, barOffset, percent, '#999', '#0f0');
      barOffset ++;
    }
  });
  // action
  drawActions(context);
}

function pathEntity(context, drawX, drawY, entity, rectangle) {
  context.beginPath();
  if(rectangle) {
    context.rect(drawX + 4, drawY + hexInf.height / 2 - hexInf.side / 2, hexInf.width - 8 , hexInf.side);
  } else {
    context.arc(drawX + hexInf.width / 2, drawY + hexInf.height / 2 , hexInf.width / 2 - 4, 0, 2 * Math.PI, false);
  }
  context.closePath();
}

function drawStatusBar(context, drawX, drawY, offset, percent, backColor, color) {
  context.fillStyle = backColor;
  context.fillRect(drawX + hexInf.width/4, drawY + 6 + offset * 3, hexInf.width/2, 3);
  context.fillStyle = color;
  context.fillRect(drawX + hexInf.width/4, drawY + 6 + offset * 3, hexInf.width/2 * percent, 3);
}

function drawActions(context) {
  var count = 0;
  if(session.turns[session.turnId-1]) {
    session.turns[session.turnId-1].actions.forEach(function(action) {
      if(actionRenderer[action.domain]) count ++;
    });
  }
  session.getTurn().actions.forEach(function(action) {
    if(actionRenderer[action.domain]) count ++;
  });
  var maxCount = count;
  var totalCount = count;
  var pCount = 0;
  if(maxCount > 5) {
    maxCount = 5;
  }
  count = 0;
  if(session.turns[session.turnId-1]) {
    session.turns[session.turnId-1].actions.forEach(function(action) {
      if(actionRenderer[action.domain]) {
        if(totalCount - 6 < count) {
          try {
            actionRenderer[action.domain](action, context, (pCount+1) / maxCount, pCount);
          } catch (e) {
            //throw e;
            console.log(e.stack);
          }
          pCount ++;
        }
        count++;
      }
    });
  }
  session.getTurn().actions.forEach(function(action, id) {
    if(actionRenderer[action.domain]) {
      if(totalCount - 6 < count) {
        try {
          actionRenderer[action.domain](action, context, (pCount+1) / maxCount, pCount);
        } catch (e) {
          //throw e;
          console.log(e.stack);
        }
        pCount ++;
      }
      count++;
    }
  });
}

function drawArrow(context, from, to, color, offsetIndex) {
  var offsetFrom = session.map.toOffsetCoord(from);
  var fromX = getRenderX(offsetFrom);
  var fromY = getRenderY(offsetFrom) - offsetIndex * 4;
  var offsetTo = session.map.toOffsetCoord(to);
  var toX = getRenderX(offsetTo);
  var toY = getRenderY(offsetTo) - offsetIndex * 4;
  context.beginPath();
  context.arc(fromX + hexInf.width/2, fromY + hexInf.height/2, 4, 0, 2 * Math.PI, false);
  canvas_arrow(context, fromX + hexInf.width/2, fromY + hexInf.height/2,
    toX + hexInf.width/2, toY + hexInf.height/2);
  context.closePath();
  context.fillStyle = color;
  context.strokeStyle = color;
  context.lineWidth = 2;
  context.fill();
  context.stroke();
}

var actionRenderer = {};

actionRenderer['Aattack'] = function(action, context, alpha, index) {
  var color = 'rgb('+(255*alpha|0)+',0,0)';
  drawArrow(context, action.entityBackup.components['Cpos'], action.targetBackup.components['Cpos'],
    color, index);
}

actionRenderer['Amove'] = function(action, context, alpha, index) {
  var color = 'rgb(0,'+(255*alpha|0)+',0)';
  drawArrow(context, action.result, action.args,
    color, index);
}

actionRenderer['Adeath'] = function(action, context, alpha, index) {
  var offsetFrom = session.map.toOffsetCoord(action.entityBackup.components['Cpos']);
  var fromX = getRenderX(offsetFrom);
  var fromY = getRenderY(offsetFrom) - index * 4;
  context.beginPath();
  context.moveTo(fromX + hexInf.width/2 - 15, fromY + hexInf.height/2 - 15);
  context.lineTo(fromX + hexInf.width/2 + 15, fromY + hexInf.height/2 + 15);
  context.moveTo(fromX + hexInf.width/2 + 15, fromY + hexInf.height/2 - 15);
  context.lineTo(fromX + hexInf.width/2 - 15, fromY + hexInf.height/2 + 15);
  context.closePath();
  context.fillStyle = 'rgb('+(255*alpha|0)+',0,0)';
  context.strokeStyle = 'rgb('+(255*alpha|0)+',0,0)';
  context.lineWidth = 2;
  context.fill();
  context.stroke();
}

actionRenderer['AspawnerSpawn'] = function(action, context, alpha, index) {
  var color = 'rgb(0,0,'+(255*alpha|0)+')';
  drawArrow(context, action.entityBackup.components['Cpos'], action.args.pos,
    color, index);
}

window.addEventListener('load', function() {
  document.getElementById('unitCanvas').addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });
  document.getElementById('unitCanvas').addEventListener('mousedown', function(e) {
    var pos   = $(this).offset();
    var elPos = { X:pos.left , Y:pos.top };
    var mPos  = { x:e.pageX-elPos.X-4, y:e.pageY-elPos.Y-4 };
    var tilePos = {};
    var posY = mPos.y / (hexInf.height-hexInf.sideY) | 0;
    var posX = mPos.x / hexInf.width | 0;
    var pixelX = mPos.x % hexInf.width;
    var pixelY = mPos.y % (hexInf.height-hexInf.sideY);
    if((posY&1) == 0) {
      tilePos.y = posY;
      tilePos.x = posX;
      if(pixelX < (hexInf.sideX - (hexInf.sideX/hexInf.sideY * pixelY))) {
        tilePos.y -= 1;
        tilePos.x -= 1;
      }
      if(pixelX > (hexInf.sideX + (hexInf.sideX/hexInf.sideY * pixelY))) {
        tilePos.y -= 1;
      }
    } else {
      tilePos.y = posY;
      tilePos.x = posX;
    if(pixelX < hexInf.sideX) {
        if(pixelX > (hexInf.sideX / hexInf.sideY * pixelY)) {
          tilePos.y -= 1;
        } else {
          tilePos.x -= 1;
        }
      } else {
        if(pixelX < (hexInf.width - hexInf.sideX / hexInf.sideY * pixelY)) {
          tilePos.y -= 1;
        }
      }
    }
    var axialPos = session.map.toAxialCoord(tilePos);
    var tile = session.map.getTile(axialPos);
    if(e.button == 2) {
      selectedTile = tile;
      handleRightClick(tile);
    } else {
      if(selectedTile != tile) {
        selectedTile = tile;
        selectedIndex = 0;
        selectedEntity = tile.children[selectedIndex];
        forceUpdate();
      } else {
        selectedIndex ++;
        selectedIndex %= tile.children.length;
        selectedEntity = tile.children[selectedIndex];
        forceUpdate();
      }
    }
  });
});
