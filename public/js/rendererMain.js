var updateQueued = false;
var lastUpdateTime = 0;
var entityInfo, actionInfo;

$(document).ready(function() {
  actionInfo = new Logger(document.getElementById('actionInfo'));
  entityInfo = new Logger(document.getElementById('entityInfo'));
});

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
  updateEntityInfo();
  updateMap();
}

var selectedTile;
var selectedEntity;
var selectedIndex = 0;

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

function handleRightClick(tile) {
  var otherEntity = tile.children[0];
  var requiredMoves = domain.get('LhexDist')(tile.position, selectedEntity.get('Cpos'));
  if(selectedEntity.get('Cown') && selectedEntity.get('Cown').player == playerId) {
    if(selectedEntity.get('Cdamage').fortify) {
      alertify.error(_('unfortifyRequired'));
      return;
    }
    if(selectedEntity.get('Cmove') && requiredMoves <= selectedEntity.get('Cmove').move && requiredMoves > 0 && otherEntity == null) {
      entityActions['move_move'].run({args: selectedEntity});
      return;
    }
    if(selectedEntity.get('Cattack') && selectedEntity.get('Cmove').move > 0 && requiredMoves <= selectedEntity.get('Cattack').range && requiredMoves > 0 && otherEntity != null &&
      otherEntity.get('Cdamage')) {
      // 짜증나는 공격 알고리즘
      var self = selectedEntity;
      var selfStat = calcAttackStats(self, otherEntity, true);
      var entityStat = calcAttackStats(otherEntity, self, false);
      var entityDamage = self.get('Cattack').attack*selfStat.attack - otherEntity.get('Cdamage').defense*entityStat.defense;
      var entityDamageAdd = self.get('Cattack').attackRandomness*selfStat.attack;
      var selfDamage = 0;
      var selfDamageAdd = 0;
      if(otherEntity.get('Cattack')) {
        selfDamage = otherEntity.get('Cattack').attack*entityStat.attack - self.get('Cdamage').defense*selfStat.defense;
        selfDamageAdd = otherEntity.get('Cattack').attackRandomness*entityStat.attack;
        if(requiredMoves > 1) {
          selfDamage = 0;
          selfDamageAdd = 0;
        }
      }
      if(selfDamage+selfDamageAdd > entityDamage+entityDamageAdd) {
        setTimeout(function() {
          alertify.confirm(_('attackYouSure'), function(e) {
            if(e) {
              entityActions['attack_attack'].run({args: {entity: selectedEntity, target: otherEntity}});
            }
          });
        }, 2);
      } else {
        entityActions['attack_attack'].run({args: {entity: selectedEntity, target: otherEntity}});
      }
      return;
    }
  }
}
