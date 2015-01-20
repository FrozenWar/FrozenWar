var cursorPos = {x:-1, y:-1, z:0};
var selectedEntity = null;
var highlighted = null;

var renderActionHook = {};
renderActionHook['Aattack'] = function(action) {
  var entityName = '';
  var target = session.map.searchEntity(action.args);
  var targetName = '';
  if(action.entity.get('Cown') && action.entity.get('Cown').player != -1) {
    entityName = _('entityOwnerDisp', session.players[action.entity.get('Cown').player].name);
  }
  if(action.entity.get('Cbuilding')) {
    entityName += getName(action.entity.get('Cbuilding'));
  }
  if(action.entity.get('Cunit')) {
    entityName += getName(action.entity.get('Cunit'));
  }
  entityName += '('+(action.result.previous.self - action.result.current.self)+')';
  
  if(target.get('Cown') && target.get('Cown').player != -1) {
    targetName = _('entityOwnerDisp', session.players[target.get('Cown').player].name);
  }
  if(target.get('Cbuilding')) {
    targetName += getName(target.get('Cbuilding'));
  }
  if(target.get('Cunit')) {
    targetName += getName(target.get('Cunit'));
  }
  targetName += '('+(action.result.previous.target - action.result.current.target)+')';
  
  
  alertify.log(_('attackedEntity',entityName,targetName));
}

// 메뉴 파트
var menuDepth = null;
var menuEntity = null;
var entityActions = {};
entityActions['endTurn'] = {
  toString: function(obj) {
    return _('endTurn');
  },
  run: function(obj) {
    endTurn();
    update();
  }
};
entityActions['suicide'] = {
  toString: function(obj) {
    return _('suicide');
  },
  run: function(obj) {
    alertify.confirm(_('confirmSuicide'), function (e, str) {
      if (e) {
        runAction(new Action('Asuicide', session, null, obj.args));
        update();
      }
    });
  }
};
entityActions['move'] = {
  toString: function(obj) {
    return _('moveStart');
  },
  run: function(obj) {
    menuEntity = obj.args;
    menuDepth = obj;
    highlighted = {x:obj.args.get('Cpos').x, y:obj.args.get('Cpos').y,
     range:obj.args.get('Cmove').move };
    update();
  },
  update: function(obj, tile, entity) {
    actionInfo.log(_('moveDescription'));
    actionInfo.log(_('moveQuickTip'));
    var requiredMoves = domain.get('LhexDist')(tile.position, obj.args.get('Cpos'));
    actionInfo.tag(_('distance'), requiredMoves + ' / '+obj.args.get('Cmove').move,
      requiredMoves > obj.args.get('Cmove').move ? 'bad' : 'good');
    if(requiredMoves <= obj.args.get('Cmove').move && requiredMoves > 0 && entity == null) {
      appendEntityAction('move_move', obj.args, true);
    }
    //printEntityInfo(actionInfo, obj.args);
  }
};
entityActions['move_move'] = {
  gray: true,
  toString: function(obj) {
    return _('moveToHere');
  },
  run: function(obj) {
    runAction(new Action('Amove', session, null, obj.args, cursorPos));
    menuEntity = null;
    menuDepth = null;
    highlighted = null;
    update();
  }
};
entityActions['attack'] = {
  toString: function(obj) {
    return _('attackStart');
  },
  run: function(obj) {
    menuEntity = obj.args;
    menuDepth = obj;
    highlighted = {x:obj.args.get('Cpos').x, y:obj.args.get('Cpos').y,
     range:obj.args.get('Cattack').range };
    update();
  },
  update: function(obj, tile, entity) {
    actionInfo.log(_('attackDescription'));
    actionInfo.log(_('attackQuickTip'));
    if(!entity) return;
    if(!entity.get('Cdamage')) return;
    var requiredMoves = domain.get('LhexDist')(tile.position, obj.args.get('Cpos'));
    actionInfo.tag(_('distance'), requiredMoves + ' / '+obj.args.get('Cattack').range,
      requiredMoves > obj.args.get('Cattack').range ? 'bad' : 'good');
    if(requiredMoves <= obj.args.get('Cattack').range && requiredMoves > 0) {
      appendEntityAction('attack_attack', {entity: menuDepth.args, target: entity}, true);
    }
    // 짜증나는 공격 알고리즘
    var self = obj.args;
    var selfStat = calcAttackStats(self, entity, true);
    var entityStat = calcAttackStats(entity, self, false);
    var entityDamage = self.get('Cattack').attack*selfStat.attack - entity.get('Cdamage').defense*entityStat.defense;
    var entityDamageAdd = self.get('Cattack').attackRandomness*selfStat.attack;
    var selfDamage = 0;
    var selfDamageAdd = 0;
    if(entity.get('Cattack')) {
      selfDamage = entity.get('Cattack').attack*entityStat.attack - self.get('Cdamage').defense*selfStat.defense;
      selfDamageAdd = entity.get('Cattack').attackRandomness*entityStat.attack;
      if(requiredMoves > 1) {
        selfDamage = 0;
        selfDamageAdd = 0;
      }
    }
    actionInfo.log(_('expectedDamage'), 'caption');
    if(selfDamage+selfDamageAdd > entityDamage+entityDamageAdd) {
      actionInfo.log(_('attackBadMoveWarn'), 'warn');
    }
    function displayBrief(self, selfDamage, selfDamageAdd, selfStat) {
      actionInfo.tag(_('health'), (function() {
        var desc = self.get('Cdamage').health+' -> '+(self.get('Cdamage').health-Math.max(0,selfDamage+selfDamageAdd|0));
        if(selfDamageAdd) {
          desc += _('numberTo')+(self.get('Cdamage').health-Math.max(0,selfDamage|0));
        }
        return desc;
      })(), 'tree');
      actionInfo.tag(_('damage'), (function() {
        var desc = Math.max(0,selfDamage|0);
        if(selfDamageAdd) {
          desc += _('numberTo')+Math.max(0,selfDamage+selfDamageAdd|0);
        }
        return desc;
      })(), 'tree');
      if(self.get('Cattack')) {
        actionInfo.tag(_('attack'), (function() {
          var desc = (self.get('Cattack').attack*selfStat.attack|0);
          if(self.get('Cattack').attackRandomness*selfStat.attack|0) {
            desc += _('numberTo')+((self.get('Cattack').attack+self.get('Cattack').attackRandomness)*selfStat.attack|0);
          }
          return desc;
        })(), 'tree');
      }
      actionInfo.tag(_('defense'), self.get('Cdamage').defense*selfStat.defense|0, 'tree');
      selfStat.combined.forEach(function(bonus) {
        actionInfo.log((bonus.other?_('opponentEffect'):'')+_('buff_'+bonus.name), 'tree');
        if(bonus.attack != null && bonus.attack != 1) actionInfo.tag(_('attack'), percentString(bonus.attack), 'subTree'+(bonus.attack>1?' good':(bonus.attack<1?' bad':'')));
        if(bonus.defense != null && bonus.defense != 1) actionInfo.tag(_('defense'), percentString(bonus.defense), 'subTree'+(bonus.defense>1?' good':(bonus.defense<1?' bad':'')));
      });
    }
    actionInfo.log(_('thisEntity'), 'caption');
    displayBrief(self, selfDamage, selfDamageAdd, selfStat);
    actionInfo.log(_('opponentEntity'), 'caption');
    displayBrief(entity, entityDamage, entityDamageAdd, entityStat);
  }
};
entityActions['attack_attack'] = {
  gray: true,
  toString: function(obj) {
    return _('attackThis');
  },
  run: function(obj) {
    var action = runAction(new Action('Aattack', session, null, obj.args.entity, obj.args.target.id));
    menuEntity = null;
    menuDepth = null;
    highlighted = null;
    update();
  }
};
entityActions['fortify'] = {
  toString: function(obj) {
    return _('fortify');
  },
  run: function(obj) {
    runAction(new Action('Afortify', session, null, obj.args, true));
    update();
  }
};
entityActions['unfortify'] = {
  toString: function(obj) {
    return _('unfortify');
  },
  run: function(obj) {
    runAction(new Action('Afortify', session, null, obj.args, false));
    update();
  }
};
entityActions['fly'] = {
  toString: function(obj) {
    return _('fly');
  },
  run: function(obj) {
    runAction(new Action('AtoggleFly', session, null, obj.args, true));
    update();
  }
};
entityActions['unfly'] = {
  toString: function(obj) {
    return _('unfly');
  },
  run: function(obj) {
    runAction(new Action('AtoggleFly', session, null, obj.args, false));
    update();
  }
};
entityActions['spawner'] = {
  toString: function(obj) {
    return _('spawnStart');
  },
  run: function(obj) {
    menuEntity = obj.args;
    menuDepth = obj;
    highlighted = {x:obj.args.get('Cpos').x, y:obj.args.get('Cpos').y,
     range:obj.args.get('Cspawner').range };
    update();
  },
  update: function(obj, tile, entity) {
    actionInfo.log(_('spawnDescription'));
    //printEntityInfo(actionInfo, obj.args);
    var requiredMoves = domain.get('LhexDist')(tile.position, obj.args.get('Cpos'));
    if(requiredMoves <= obj.args.get('Cspawner').range && requiredMoves != 0 && entity == null) {
      obj.args.get('Cspawner').spawnable.forEach(function(value) {
        var dummyEntity = session.spawnEntity(value, 633442);
        if(dummyEntity.get('Cspawn')) {
          if(dummyEntity.get('Cspawn').supply > session.players[playerId].resources.supply) return;
          if(dummyEntity.get('Cspawn').troops > session.players[playerId].resources.troops) return;
        }
        var element = appendEntityAction('spawner_spawn', {entity: obj.args, key: value}, true, true);
        element.addClass('logbox');
        element.addClass('logboxButton');
        var buttonLogger = new Logger(element[0]);
        printEntityInfo(buttonLogger, dummyEntity, true);
      });
    }
  }
};
entityActions['spawner_spawn'] = {
  gray: true,
  toString: function(obj) {
    var desc = obj.args.key;
    var entityProt = domain.get(obj.args.key);
    if(entityProt['Cbuilding']) desc = getName(entityProt['Cbuilding']);
    if(entityProt['Cunit']) desc = getName(entityProt['Cunit']);
    if(entityProt['Cspawn']) desc += ' T:'+ entityProt['Cspawn'].troops +' S:'+entityProt['Cspawn'].supply;
    return _('spawnThis', desc);
  },
  run: function(obj) {
    //var action = runAction(new Action('Aattack', session, null, obj.args.entity, obj.args.target.id));
    runAction(new Action('AspawnerSpawn', session, null, obj.args.entity, {pos: cursorPos, 
      domain: obj.args.key}));
    menuEntity = null;
    menuDepth = null;
    highlighted = null;
    update();
  }
};
entityActions['abort'] = {
  gray: true,
  toString: function(obj) {
    return _('cancel');
  },
  run: function(obj) {
    menuEntity = null;
    menuDepth = null;
    highlighted = null;
    update();
  }
};

function appendEntityAction(domain, args, force, bare) {
  if(menuDepth && !force) return;
  var currentOrder = -1;
  if(session.turnId >= 0) {
    currentOrder = session.getTurn().order;
  }
  if(playerId != currentOrder) return;
  var obj = {
    domain: domain,
    args: args
  };
  var element = $(document.createElement('div'));
  if(!bare) {
    element.text(entityActions[obj.domain].toString(obj));
    element.addClass('button');
    if(entityActions[obj.domain].gray) element.addClass('buttonGray');
  }
  element.click(function() {
    entityActions[obj.domain].run(obj);
  });
  $('#actionList').append(element);
  return element;
}

function updateContext() {
  $('#currentTurn').text(session.turnId+1);
  $('#sessionPlayerList').find('li').remove();
  var currentOrder = -1;
  if(session.turnId >= 0) {
    currentOrder = session.getTurn().order;
  }
  session.players.forEach(function(player) {
    var element = $(document.createElement('li'));
    element.text(player.name);
    element.css('color', getColorIdentPlayer(colors.text, session, player.id));
    if(currentOrder == player.id) {
      element.addClass('turn');
    }
    $('#sessionPlayerList').append(element);
  });
}

function update() {
  if(updateQueued) return;
  console.log(new Date().getTime() - lastUpdateTime);
  if((new Date().getTime() - lastUpdateTime) < 200) {
    updateQueued = true;
    setTimeout(forceUpdate, 200);
  } else {
    updateQueued = true;
    setTimeout(forceUpdate, 12);
  }
}

function forceUpdate() {
  console.log('calling redraw');
  updateQueued = false;
  lastUpdateTime = new Date().getTime();
  updateContext();
  updateMap();
  updateEntityInfo();
}

var updateQueued = false;
var lastUpdateTime = 0;

var renderSystems = {};
var rootRenderSystems = {};

function updateMap() {
  var canvas = document.getElementById('unitCanvas');
  canvas.width = session.map.width * hexInf.width + hexInf.width / 2 + 4;
  canvas.height = session.map.height * (hexInf.height-hexInf.sideY) + hexInf.sideY + 4;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for(var y = 0; y < session.map.width; ++y) {
    var py = y * (hexInf.height-hexInf.sideY) + 2;
    for(var x = 0; x < session.map.height; ++x) {
      var px = x * hexInf.width + (hexInf.width / 2 * (y&1)) + 2;
      var tile = session.map.getTileByOffset(new Point(x, y));
      for(var key in renderSystems) {
        renderSystems[key](tile, px, py, ctx);
      }
    }
  }
  for(var key in rootRenderSystems) {
    rootRenderSystems[key](ctx);
  }
}

var entityInfo, actionInfo;

$(document).ready(function() {
  actionInfo = new Logger(document.getElementById('actionInfo'));
  entityInfo = new Logger(document.getElementById('entityInfo'));
});
function updateEntityInfo() {
  entityInfo.clear();
  actionInfo.clear();
  $('#actionList').empty();
  appendEntityAction('endTurn');
  if(session.getPlayer()) {
    entityInfo.tag(_('troops'), session.getPlayer().resources['troops']);
    entityInfo.tag(_('supply'), session.getPlayer().resources['supply']);
  }
  var tile = session.map.getTile(cursorPos);
  if(!tile) {
    entityInfo.log(_('noTileSelected'));
    return;
  }
  var entity = tile.children[cursorPos.z];
  if(menuDepth) {
    appendEntityAction('abort', null, true);
    actionInfo.dom.style.display = 'block';
    entityActions[menuDepth.domain].update(menuDepth, tile, entity);
  } else {
    actionInfo.dom.style.display = 'none';
  }
  if(entity) {
    printEntityInfo(entityInfo, entity);
    if(entity.get('Cdamage') && entity.get('Cdamage').fortify) {
      appendEntityAction('unfortify', entity);
    } else {
      if(entity.get('Cdamage') && entity.get('Cown') && 
        entity.get('Cown').player == session.getTurn().order)
        appendEntityAction('suicide', entity);
      if(entity.get('Cattack') && entity.get('Cown') && 
        entity.get('Cown').player == session.getTurn().order &&
        (!entity.get('Cmove') || entity.get('Cmove').move >= 1))
        appendEntityAction('attack', entity);
      if(entity.get('Cdamage') && entity.get('Cown') && 
        entity.get('Cown').player == session.getTurn().order &&
        (!entity.get('Cmove') || entity.get('Cmove').move >= 1))
        appendEntityAction('fortify', entity);
      if(entity.get('Cfly') && entity.get('Cown') && 
        entity.get('Cown').player == session.getTurn().order &&
        (!entity.get('Cmove') || entity.get('Cmove').move >= 1)) {
        if(entity.get('Cfly').fly) {
          appendEntityAction('unfly', entity);
        } else {
          if(!entity.get('Cpower') || entity.get('Cpower').power >= entity.get('Cfly').consume) {
            appendEntityAction('fly', entity);
          }
        }
      }
      if(entity.get('Cspawner') && entity.get('Cown') && 
        entity.get('Cown').player == session.getTurn().order)
        appendEntityAction('spawner', entity);
      if(entity.get('Cmove') && entity.get('Cown') && 
        entity.get('Cown').player == session.getTurn().order &&
        entity.get('Cmove').move >= 1)
        appendEntityAction('move', entity);
    }
  } else {
    entityInfo.log(_('noEntitySelected'));
  }
}

function printEntityInfo(logger, entity, dead) {
  if(entity.get('Cbuilding')) {
    logger.log(_('buildingTitle', getName(entity.get('Cbuilding'))), 'logTitle');
    logger.tag(_('team'), _('team_'+entity.get('Cbuilding').team));
  }
  if(entity.get('Cunit')) {
    logger.log(_('unitTitle', getName(entity.get('Cunit'))), 'logTitle');
    logger.tag(_('team'), _('team_'+entity.get('Cunit').team));
  }
  if(entity.get('Cown') && !dead) {
    if(entity.get('Cown').player == -1) {
      logger.tag(_('owner'), _('ownerNone'));
    } else {
      var player = session.players[entity.get('Cown').player];
      var tag = logger.tag(_('owner'), player.name);
      tag.style.color = getColorIdent(colors.text, session, entity);
    }
  }
  if(entity.get('Cdamage')) {
    var percentage = entity.get('Cdamage').health / entity.get('Cdamage').maxHealth;
    if(!dead) {
      logger.tag(_('health'), entity.get('Cdamage').health + ' / ' +
        entity.get('Cdamage').maxHealth, percentage <= 0.1 ? 'bad' : '');
    } else {
      logger.tag(_('health'), entity.get('Cdamage').maxHealth);
    }
    logger.tag(_('defense'), entity.get('Cdamage').defense);
    if(entity.get('Cdamage').fortify) {
      logger.log(_('fortified'), 'good');
    }
  }
  if(entity.get('Cattack')) {
    var attackNum = entity.get('Cattack').attack;
    if(entity.get('Cattack').attackRandomness) {
      attackNum += _('numberTo')+(entity.get('Cattack').attack+entity.get('Cattack').attackRandomness);
    }
    logger.tag(_('attack'), attackNum);
    logger.tag(_('range'), entity.get('Cattack').range, 'tree');
  }
  if(entity.get('Cpower')) {
    if(!dead) {
      logger.tag(_('power'), entity.get('Cpower').power + ' / ' +
        entity.get('Cpower').maxPower);
    } else {
      logger.tag(_('power'), entity.get('Cpower').maxPower);
    }
    logger.tag(_('powerConsume'), entity.get('Cpower').consume, 'tree');
    logger.tag(_('powerHeal'), entity.get('Cpower').heal, 'tree');
  }
  if(entity.get('Cfly')) {
    logger.tag(_('flying'), entity.get('Cfly').fly ? 'true' : 'false');
    logger.tag(_('flyingConsume'), entity.get('Cfly').consume, 'tree');
  }
  if(entity.get('Cmagic')) {
    logger.tag(_('magicConsume'), entity.get('Cmagic').consume);
  }
  if(entity.get('Cspawn')) {
    logger.log(_('spawnCost'), 'caption');
    logger.tag(_('troops'), entity.get('Cspawn').troops, 'tree');
    logger.tag(_('supply'), entity.get('Cspawn').supply, 'tree');
  }
  if(entity.get('Cmove')) {
    if(!dead)
      logger.tag(_('moveLimit'), entity.get('Cmove').move + ' / '+entity.get('Cmove').maxMove);
    else logger.tag(_('moveLimit'), entity.get('Cmove').maxMove);
  }
  // Traits
  if(entity.get('Cdamage')) {
    logger.log(_('traits'), 'caption');
    buffTree(logger, entity, 'Cdamage', 'fortify');
    if(entity.get('Cfly')) {
      buffTree(logger, entity, 'Cdamage', 'fly');
    }
    buffTree(logger, entity, 'Cattack', 'always');
    buffTree(logger, entity, 'Cattack', 'self_non_fortify');
    buffTree(logger, entity, 'Cattack', 'self_fortify');
    buffTree(logger, entity, 'Cattack', 'ranged');
    buffTree(logger, entity, 'Cattack', 'melee');
    buffTree(logger, entity, 'Cattack', 'self_fly');
    buffTree(logger, entity, 'Cattack', 'self_non_fly');
    buffTree(logger, entity, 'Cattack', 'other_non_fortify');
    buffTree(logger, entity, 'Cattack', 'other_fortify');
    buffTree(logger, entity, 'Cattack', 'first');
    buffTree(logger, entity, 'Cattack', 'counter');
    buffTree(logger, entity, 'Cattack', 'unit');
    buffTree(logger, entity, 'Cattack', 'building');
  }
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
    if(e.button == 2) {
      // right click
      if(selectedEntity && selectedEntity.get('Cpos')) { 
        var tile = session.map.getTileByOffset(tilePos);
        cursorPos.x = axialPos.x;
        cursorPos.y = axialPos.y;
        cursorPos.z = 0;
        var requiredMoves = domain.get('LhexDist')(cursorPos, selectedEntity.get('Cpos'));
        if(selectedEntity.get('Cown') && selectedEntity.get('Cown').player == playerId) {
          if(selectedEntity.get('Cdamage').fortify) {
            alertify.error(_('unfortifyRequired'));
            return;
          }
          if(selectedEntity.get('Cmove') && requiredMoves <= selectedEntity.get('Cmove').move && requiredMoves > 0 && tile.children[0] == null) {
            entityActions['move_move'].run({args: selectedEntity});
            return;
          }
          if(selectedEntity.get('Cattack') && selectedEntity.get('Cmove').move > 0 && requiredMoves <= selectedEntity.get('Cattack').range && requiredMoves > 0 && tile.children[0] != null &&
            tile.children[0].get('Cdamage')) {
            // 짜증나는 공격 알고리즘
            var self = selectedEntity;
            var selfStat = calcAttackStats(self, tile.children[0], true);
            var entityStat = calcAttackStats(tile.children[0], self, false);
            var entityDamage = self.get('Cattack').attack*selfStat.attack - tile.children[0].get('Cdamage').defense*entityStat.defense;
            var entityDamageAdd = self.get('Cattack').attackRandomness*selfStat.attack;
            var selfDamage = 0;
            var selfDamageAdd = 0;
            if(tile.children[0].get('Cattack')) {
              selfDamage = tile.children[0].get('Cattack').attack*entityStat.attack - self.get('Cdamage').defense*selfStat.defense;
              selfDamageAdd = tile.children[0].get('Cattack').attackRandomness*entityStat.attack;
              if(requiredMoves > 1) {
                selfDamage = 0;
                selfDamageAdd = 0;
              }
            }
            if(selfDamage+selfDamageAdd > entityDamage+entityDamageAdd) {
              setTimeout(function() {
                alertify.confirm(_('attackYouSure'), function(e) {
                  if(e) {
                    entityActions['attack_attack'].run({args: {entity: selectedEntity, target: tile.children[0]}});
                  }
                });
              }, 2);
            } else {
              entityActions['attack_attack'].run({args: {entity: selectedEntity, target: tile.children[0]}});
            }
            return;
          }
        }
      }
    }
    if(session && (cursorPos.x != axialPos.x || cursorPos.y != axialPos.y)) {
      cursorPos.x = axialPos.x;
      cursorPos.y = axialPos.y;
      cursorPos.z = 0;
      var tile = session.map.getTileByOffset(tilePos);
      selectedEntity = tile.children[cursorPos.z];
      updateMap();
      updateEntityInfo();
    } else {
      var tile = session.map.getTileByOffset(tilePos);
      cursorPos.z ++;
      cursorPos.z %= tile.children.length;
      selectedEntity = tile.children[cursorPos.z];
      updateMap();
      updateEntityInfo();
    }
  });
});

renderSystems['tile'] = function(tile, px, py, ctx) {
  ctx.beginPath();
  ctx.moveTo(px + hexInf.sideX, py);
  ctx.lineTo(px + hexInf.width, py + hexInf.sideY);
  ctx.lineTo(px + hexInf.width, py + hexInf.sideY + hexInf.side);
  ctx.lineTo(px + hexInf.sideX, py + hexInf.sideY*2 + hexInf.side);
  ctx.lineTo(px, py + hexInf.sideY + hexInf.side);
  ctx.lineTo(px, py + hexInf.sideY);
  ctx.closePath();
}

/*var grassTexture;
var grassImg = new Image();
grassImg.src = './img/grass.png';*/

renderSystems['fill'] = function(tile, px, py, ctx) {
  /*if(!grassTexture) {
    grassTexture = ctx.createPattern(grassImg, "repeat");
  }*/
  var palette = ['#F0F0F0', '#FFD5D5', '#D5FFD7', '#FFFFD7'];
  //ctx.fillStyle = palette[((tile.position.x&1)^((tile.position.y&1)))];
  ctx.fillStyle = '#F0F0F0';
  if(selectedEntity && selectedEntity.get('Cmove') && domain.get('LhexDist')(tile.position,  selectedEntity.get('Cpos')) <= selectedEntity.get('Cmove').move) {
    ctx.fillStyle = '#F0FFF0';
  }
  if(selectedEntity && selectedEntity.get('Cattack') && selectedEntity.get('Cmove').move > 0 && domain.get('LhexDist')(tile.position,  selectedEntity.get('Cpos')) <= selectedEntity.get('Cattack').range) {
    ctx.fillStyle = '#FFF0F0';
  }
  if(selectedEntity && selectedEntity.get('Cmove') && domain.get('LhexDist')(tile.position,  selectedEntity.get('Cpos')) <= selectedEntity.get('Cmove').move && selectedEntity.get('Cattack') && selectedEntity.get('Cattack').range > selectedEntity.get('Cmove').move) {
    ctx.fillStyle = '#F0FFF0';
  }
  if(highlighted && domain.get('LhexDist')(tile.position, highlighted) <= highlighted.range) {
    ctx.fillStyle = '#F0F0FF';
  }
  if(tile.position.x == cursorPos.x && tile.position.y == cursorPos.y) {
    ctx.fillStyle = '#FFFFFF';
  }
  ctx.fill();
}

renderSystems['border'] = function(tile, px, py, ctx) {
  ctx.strokeStyle = "#999";
  ctx.lineWidth = 1;
  ctx.stroke();
}


renderSystems['pos'] = function(tile, px, py, ctx) {
  ctx.fillStyle = '#000000';
  ctx.font = '14px NanumGothic';
  ctx.textBaseline = "middle";
  var name = tile.position.x + ',' +tile.position.y;
  ctx.fillText(name, px + hexInf.width/2 - ctx.measureText(name).width/2, 
      py + hexInf.height / 2);
}

function getColorIdent(hsv, session, entity) {
  return getColorIdentPlayer(hsv, session, entity.get('Cown') && entity.get('Cown').player);
}

function getColorIdentPlayer(hsv, session, player) {
  var h = 0;
  var s = hsv.s;
  var v = hsv.v;
  if(player) {
    h = player / session.players.length * (0.75);
    if(player == -1 || player == null) {
      h = 0;
      s = 0;
    }
  }
  return RGBtoString(HSVtoRGB(h,s,v));
}

renderSystems['entity'] = function(tile, px, py, ctx) {
  var offset = 0;
  //Search for the building..
  tile.children.forEach(function(entity, key) {
    if(!(entity.get('Cbuilding') || entity.get('Cunit'))) return;
    var offset2 = 0;
    if(entity.get('Cfly') && entity.get('Cfly').fly) {
      offset2 = 6;
      //draw shadow
      ctx.beginPath();
      if(entity.get('Cbuilding')) {
        ctx.rect(px + 4 - offset * 4, py + hexInf.height / 2 - hexInf.side / 2 - offset * 4, hexInf.width - 8 , hexInf.side);
      } else {
        ctx.arc(px + hexInf.width / 2 - offset * 4, py + hexInf.height / 2 - offset * 4, hexInf.width / 2 - 4, 0, 2 * Math.PI, false);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fill();
    }
    ctx.beginPath();
    if(entity.get('Cbuilding')) {
      ctx.rect(px + 4 - offset * 4 - offset2, py + hexInf.height / 2 - hexInf.side / 2 - offset * 4 - offset2, hexInf.width - 8 , hexInf.side);
    } else {
      ctx.arc(px + hexInf.width / 2 - offset * 4 - offset2, py + hexInf.height / 2 - offset * 4 - offset2, hexInf.width / 2 - 4, 0, 2 * Math.PI, false);
    }
    ctx.closePath();
    ctx.fillStyle = getColorIdent(colors.background, session, entity);
    ctx.strokeStyle = getColorIdent(colors.border, session, entity);
    if(entity == menuEntity) {
      ctx.fillStyle = '#FFFF00';
    }
    if(tile.position.x == cursorPos.x && tile.position.y == cursorPos.y &&
      cursorPos.z == key) {
      ctx.strokeStyle = '#FFFFFF';
    }
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = getColorIdent(colors.text, session, entity);
    ctx.font = '14px NanumGothic';
    ctx.textBaseline = "middle";
    var name = '';
    if(entity.get('Cbuilding')) {
      name = getName(entity.get('Cbuilding'));
    } else {
      name = getName(entity.get('Cunit'));
    }
    ctx.fillText(name, px + hexInf.width/2 - ctx.measureText(name).width/2 - offset * 4 - offset2, 
        py + hexInf.height / 2 - offset * 4 - offset2);
    
    if(entity.get('Cdamage')) {
      ctx.fillStyle = '#999';
      ctx.fillRect(px + hexInf.width/4 - offset * 4 - offset2, py + 6 + 0 - offset * 4 - offset2, hexInf.width/2, 3);
      if(entity.get('Cdamage').fortify) {
        ctx.fillStyle = '#ff0';
      } else {
        ctx.fillStyle = '#f00';
      }
      ctx.fillRect(px + hexInf.width/4 - offset * 4 - offset2, py + 6 + 0 - offset * 4 - offset2, hexInf.width/2 * 
        (entity.get('Cdamage').health / entity.get('Cdamage').maxHealth), 3);
    }
    if(entity.get('Cpower')) {
      ctx.fillStyle = '#999';
      ctx.fillRect(px + hexInf.width/4 - offset * 4 - offset2, py + 6 + 3 - offset * 4 - offset2, hexInf.width/2, 3);
      ctx.fillStyle = '#00f';
      ctx.fillRect(px + hexInf.width/4 - offset * 4 - offset2, py + 6 + 3 - offset * 4 - offset2, hexInf.width/2 * 
        (entity.get('Cpower').power / entity.get('Cpower').maxPower), 3);
    }
    if(entity.get('Cmove')) {
      ctx.fillStyle = '#999';
      ctx.fillRect(px + hexInf.width/4 - offset * 4 - offset2, py + 6 + 6 - offset * 4 - offset2, hexInf.width/2, 3);
      ctx.fillStyle = '#0f0';
      ctx.fillRect(px + hexInf.width/4 - offset * 4 - offset2, py + 6 + 6 - offset * 4 - offset2, hexInf.width/2 * 
        (entity.get('Cmove').move / entity.get('Cmove').maxMove), 3);
    }
    offset ++;
  });
}

function canvas_arrow(context, fromx, fromy, tox, toy){
  var headlen = 10;   // length of head in pixels
  var angle = Math.atan2(toy-fromy,tox-fromx);
  context.moveTo(fromx, fromy);
  context.lineTo(tox, toy);
  context.moveTo(tox-headlen*Math.cos(angle-Math.PI/6),toy-headlen*Math.sin(angle-Math.PI/6));
  context.lineTo(tox, toy);
  context.lineTo(tox-headlen*Math.cos(angle+Math.PI/6),toy-headlen*Math.sin(angle+Math.PI/6));
}

rootRenderSystems['action'] = function(ctx) {
  // Calculate all displayed action first
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
  if(maxCount > 6) {
    maxCount = 6;
  }
  count = 0;
  if(session.turns[session.turnId-1]) {
    session.turns[session.turnId-1].actions.forEach(function(action) {
      if(actionRenderer[action.domain]) {
        if(totalCount - 6 < count) {
          try {
            actionRenderer[action.domain](action, ctx, (pCount+1) / maxCount, pCount);
          } catch (e) {
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
          actionRenderer[action.domain](action, ctx, (pCount+1) / maxCount, pCount);
        } catch (e) {
          console.log(e.stack);
        }
        pCount ++;
      }
      count++;
    }
  });
}

var actionRenderer = {};
actionRenderer['Aattack'] = function(action, ctx, alpha, index) {
  var offsetOrigin = session.map.toOffsetCoord(action.entityBackup.components['Cpos']);
  var originY = offsetOrigin.y * (hexInf.height-hexInf.sideY) + 2 - (index % 6) * 2;
  var originX = offsetOrigin.x * hexInf.width + (hexInf.width / 2 * (offsetOrigin.y&1)) + 2;
  var offsetTarget = session.map.toOffsetCoord(action.targetBackup.components['Cpos']);
  var targetY = offsetTarget.y * (hexInf.height-hexInf.sideY) + 2 - (index % 6) * 2;
  var targetX = offsetTarget.x * hexInf.width + (hexInf.width / 2 * (offsetTarget.y&1)) + 2;
  ctx.beginPath();
  ctx.arc(originX + hexInf.width/2, originY + hexInf.height/2, 4, 0, 2 * Math.PI, false);
  canvas_arrow(ctx, originX + hexInf.width/2, originY + hexInf.height/2,
    targetX + hexInf.width/2, targetY + hexInf.height/2);
  ctx.closePath();
  ctx.fillStyle = 'rgb('+(255*alpha|0)+',0,0)';
  ctx.strokeStyle = 'rgb('+(255*alpha|0)+',0,0)';
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
}

actionRenderer['Amove'] = function(action, ctx, alpha, index) {
  var offsetOrigin = session.map.toOffsetCoord(action.result);
  var originY = offsetOrigin.y * (hexInf.height-hexInf.sideY) + 2 - (index % 6) * 2;
  var originX = offsetOrigin.x * hexInf.width + (hexInf.width / 2 * (offsetOrigin.y&1)) + 2;
  var offsetTarget = session.map.toOffsetCoord(action.args);
  var targetY = offsetTarget.y * (hexInf.height-hexInf.sideY) + 2 - (index % 6) * 2;
  var targetX = offsetTarget.x * hexInf.width + (hexInf.width / 2 * (offsetTarget.y&1)) + 2;
  ctx.beginPath();
  ctx.arc(originX + hexInf.width/2, originY + hexInf.height/2, 4, 0, 2 * Math.PI, false);
  canvas_arrow(ctx, originX + hexInf.width/2, originY + hexInf.height/2,
    targetX + hexInf.width/2, targetY + hexInf.height/2);
  ctx.closePath();
  ctx.fillStyle = 'rgb(0,'+(255*alpha|0)+',0)';
  ctx.strokeStyle = 'rgb(0,'+(255*alpha|0)+',0)';
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
}

actionRenderer['Adeath'] = function(action, ctx, alpha, index) {
  var offsetOrigin = session.map.toOffsetCoord(action.entityBackup.components['Cpos']);
  var originY = offsetOrigin.y * (hexInf.height-hexInf.sideY) + 2 - (index % 6) * 2;
  var originX = offsetOrigin.x * hexInf.width + (hexInf.width / 2 * (offsetOrigin.y&1)) + 2;
  ctx.beginPath();
  ctx.moveTo(originX + hexInf.width/2 - 15, originY + hexInf.height/2 - 15);
  ctx.lineTo(originX + hexInf.width/2 + 15, originY + hexInf.height/2 + 15);
  ctx.moveTo(originX + hexInf.width/2 + 15, originY + hexInf.height/2 - 15);
  ctx.lineTo(originX + hexInf.width/2 - 15, originY + hexInf.height/2 + 15);
  ctx.closePath();
  ctx.fillStyle = 'rgb('+(255*alpha|0)+',0,0)';
  ctx.strokeStyle = 'rgb('+(255*alpha|0)+',0,0)';
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
}

actionRenderer['AspawnerSpawn'] = function(action, ctx, alpha, index) {
  var offsetOrigin = session.map.toOffsetCoord(action.entityBackup.components['Cpos']);
  var originY = offsetOrigin.y * (hexInf.height-hexInf.sideY) + 2 - (index % 6) * 2;
  var originX = offsetOrigin.x * hexInf.width + (hexInf.width / 2 * (offsetOrigin.y&1)) + 2;
  var offsetTarget = session.map.toOffsetCoord(action.args.pos);
  var targetY = offsetTarget.y * (hexInf.height-hexInf.sideY) + 2 - (index % 6) * 2;
  var targetX = offsetTarget.x * hexInf.width + (hexInf.width / 2 * (offsetTarget.y&1)) + 2;
  ctx.beginPath();
  ctx.arc(originX + hexInf.width/2, originY + hexInf.height/2, 4, 0, 2 * Math.PI, false);
  canvas_arrow(ctx, originX + hexInf.width/2, originY + hexInf.height/2,
    targetX + hexInf.width/2, targetY + hexInf.height/2);
  ctx.closePath();
  ctx.fillStyle = 'rgb(0,0,'+(255*alpha|0)+')';
  ctx.strokeStyle = 'rgb(0,0,'+(255*alpha|0)+')';
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
}
