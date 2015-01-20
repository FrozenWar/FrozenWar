var menuDepth = null;
var menuEntity = null;
var entityActions = {};
// Yeah I know, it's painful. Spaghetti code incoming!
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
    update();
  },
  update: function(obj, tile, entity) {
    setHighlight(new Highlight(obj.args.get('Cpos').x, obj.args.get('Cpos').y,
      obj.args.get('Cmove').move, '#F0F0FF'));
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
    runAction(new Action('Amove', session, null, obj.args, selectedTile.position));
    menuEntity = null;
    menuDepth = null;
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
    update();
  },
  update: function(obj, tile, entity) {
    setHighlight(new Highlight(obj.args.get('Cpos').x, obj.args.get('Cpos').y,
      obj.args.get('Cattack').range, '#F0F0FF'));
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
    update();
  },
  update: function(obj, tile, entity) {
    setHighlight(new Highlight(obj.args.get('Cpos').x, obj.args.get('Cpos').y,
      obj.args.get('Cspawner').range, '#F0F0FF'));
    actionInfo.log(_('spawnDescription'));
    //printEntityInfo(actionInfo, obj.args);
    var requiredMoves = domain.get('LhexDist')(tile.position, obj.args.get('Cpos'));
    if(requiredMoves <= obj.args.get('Cspawner').range && requiredMoves != 0 && entity == null) {
      if(!obj.doms) {
        //obj.doms = document.createDocumentFragment();
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
          //obj.doms.appendChild(element[0].cloneNode(true));
        });
      } else {
        //$('#actionList')[0].appendChild(obj.doms.cloneNode(true));
      }
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
    runAction(new Action('AspawnerSpawn', session, null, obj.args.entity, {pos: selectedTile.position, 
      domain: obj.args.key}));
    menuEntity = null;
    menuDepth = null;
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

// action hooks.

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

//update entity info.

function updateEntityInfo() {
  //resetHighlight();
  highlights = [];
  entityInfo.clear();
  actionInfo.clear();
  $('#actionList').empty();
  appendEntityAction('endTurn');
  if(session.getPlayer()) {
    entityInfo.tag(_('troops'), session.getPlayer().resources['troops']);
    entityInfo.tag(_('supply'), session.getPlayer().resources['supply']);
  }
  var tile = selectedTile;
  if(!tile) {
    entityInfo.log(_('noTileSelected'));
    return;
  }
  
  setHighlight(new Highlight(tile.position.x, tile.position.y, 0, '#fff'));
  
  if(selectedEntity && selectedEntity.get('Cattack')) {
    if(selectedEntity.get('Cmove').move > 0) {
      setHighlight(new Highlight(tile.position.x, tile.position.y, selectedEntity.get('Cattack').range, '#FFF0F0'));
    } else {
      setHighlight(new Highlight(tile.position.x, tile.position.y, selectedEntity.get('Cattack').range, '#DBCECE'));
    }
  }
  if(selectedEntity && selectedEntity.get('Cmove')) {
    if(selectedEntity.get('Cmove').move != selectedEntity.get('Cmove').maxMove) {
      setHighlight(new Highlight(tile.position.x, tile.position.y, selectedEntity.get('Cmove').maxMove, '#D3E0D4'));
    }
    if(selectedEntity.get('Cmove').move > 0) {
      setHighlight(new Highlight(tile.position.x, tile.position.y, selectedEntity.get('Cmove').move, '#F0FFF0'));
    }
  }
  
  var entity = selectedEntity;
  if(menuDepth) {
    appendEntityAction('abort', null, true);
    actionInfo.dom.style.display = 'block';
    entityActions[menuDepth.domain].update(menuDepth, tile, entity);
  } else {
    actionInfo.dom.style.display = 'none';
  }
  if(entity) {
    printEntityInfo(entityInfo, entity);
    if(entity.get('Cown') && entity.get('Cown').player == session.getTurn().order) {
      if(entity.get('Cdamage') && entity.get('Cdamage').fortify) {
        appendEntityAction('unfortify', entity);
      } else {
        if(entity.get('Cdamage'))
          appendEntityAction('suicide', entity);
        if(entity.get('Cattack') && (!entity.get('Cmove') || entity.get('Cmove').move >= 1)) {
          appendEntityAction('attack', entity);
          appendEntityAction('fortify', entity);
        }
        if(entity.get('Cfly') && (!entity.get('Cmove') || entity.get('Cmove').move >= 1)) {
          if(entity.get('Cfly').fly) {
            appendEntityAction('unfly', entity);
          } else {
            if(!entity.get('Cpower') || entity.get('Cpower').power >= entity.get('Cfly').consume) {
              appendEntityAction('fly', entity);
            }
          }
        }
        if(entity.get('Cspawner'))
          appendEntityAction('spawner', entity);
        if(entity.get('Cmove') && entity.get('Cmove').move >= 1)
          appendEntityAction('move', entity);
      }
    }
  } else {
    entityInfo.log(_('noEntitySelected'));
  }
}

// Yeah this was painful to write.

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
