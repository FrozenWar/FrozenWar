function calcAttackStats(entity, target, first) {
  var attack = 1;
  var defense = 1;
  var attackArr = [];
  var defenseArr = [];
  var combinedArr = [];
  function applyStatRaw(entity, component, name, other) {
    if(!entity) return;
    if(!entity.get(component)) return;
    if(!entity.get(component).bonus) return;
    if(!entity.get(component).bonus[name]) return;
    var bonus = entity.get(component).bonus[name];
    var combined = {name: name};
    var changes = false;
    if(other) {
      combined.other = true;
      if(bonus.other_attack != null && bonus.other_attack != 1) {
        attack *= bonus.other_attack;
        attackArr.push({name: name, value: bonus.other_attack});
        combined.attack = bonus.other_attack;
        changes = true;
      }
      if(bonus.other_defense != null && bonus.other_defense != 1) {
        defense *= bonus.other_defense;
        defenseArr.push({name: name, value: bonus.other_defense});
        combined.defense = bonus.other_defense;
        changes = true;
      }
    } else {
      if(bonus.attack != null && bonus.attack != 1) {
        attack *= bonus.attack;
        attackArr.push({name: name, value: bonus.attack});
        combined.attack = bonus.attack;
        changes = true;
      }
      if(bonus.defense != null && bonus.defense != 1) {
        defense *= bonus.defense;
        defenseArr.push({name: name, value: bonus.defense});
        combined.defense = bonus.defense;
        changes = true;
      }
    }
    if(changes) combinedArr.push(combined);
  }
  function applyStat(entity, target, component, name, other) {
    applyStatRaw(entity, component, name, other);
    applyStatRaw(target, component, name, !other);
  }
  applyStat(entity, target, 'Cattack', 'always');
  applyStat(entity, target, 'Cattack', 'power');
  if(entity.get('Cdamage').fortify) {
    applyStat(entity, target, 'Cdamage', 'fortify');
    applyStat(entity, target, 'Cattack', 'self_fortify');
    if(entity.get('Cmagic') && entity.get('Cpower').power > 0) {
      applyStat(entity, target, 'Cdamage', 'magic_fortify');
    }
  } else {
    applyStat(entity, target, 'Cattack', 'self_non_fortify');
  }
  if(target.get('Cdamage').fortify) {
    applyStat(entity, target, 'Cattack', 'other_fortify');
  } else {
    applyStat(entity, target, 'Cattack', 'other_non_fortify');
  }
  if(entity.get('Cfly') && entity.get('Cfly').fly) {
    applyStat(entity, target, 'Cdamage', 'fly');
    applyStat(entity, target, 'Cattack', 'self_fly');
  } else {
    applyStat(entity, target, 'Cattack', 'self_non_fly');
  }
  if(target.get('Cfly') && target.get('Cfly').fly) {
    applyStat(entity, target, 'Cattack', 'other_fly');
    if(entity.get('Cattack')) {
      if(entity.get('Cattack').range <= 1 && first && 
        !(entity.get('Cfly') && entity.get('Cfly').fly)) {
        applyStat(entity, target, 'Cattack', 'other_fly_melee_first');
      }
    }
  }
  if(target.get('Cattack'))
    if(target.get('Cattack').range <= 1) {
      applyStat(entity, target, 'Cattack', 'melee');
    } else {
      applyStat(entity, target, 'Cattack', 'ranged');
    }
  if(target.get('Cbuilding')) {
    applyStat(entity, target, 'Cattack', 'building');
  }
  if(target.get('Cunit')) {
    applyStat(entity, target, 'Cattack', 'unit');
  }
  if(first) {
    applyStat(entity, target, 'Cattack', 'first');
  } else {
    applyStat(entity, target, 'Cattack', 'counter');
  }
  return {attack: attack, defense: defense,
    attackArr: attackArr, defenseArr: defenseArr, combined: combinedArr};
}

function attackEntity(entity, target, first) {
  var attack = entity.get('Cattack').attack + 
    (Math.random()*entity.get('Cattack').attackRandomness);
  var defense = target.get('Cdamage').defense;
  var entityMod = calcAttackStats(entity, target, first);
  var targetMod = calcAttackStats(target, entity, !first);
  attack *= entityMod.attack;
  defense *= targetMod.defense;
  return Math.max(0, attack - defense | 0);
}
// TODO 체력 회복은?
// Afortify, Asuicide <debug>, Adeath <internal>, Sdamage
domain.assign('Cdamage', {
  health: 0,
  maxHealth: 0,
  defense: 0,
  fortify: false,
  bonus: {
    fortify: {
      defense: 1.5
    },
    fly: {
      defense: 1.2
    },
    magic_fortify: {
      defense: 1.1
    }
  }
});

domain.assign('AhealthHeal', {
  depends: ['Cdamage'],
  internal: true,
  run: function() {
    if(this.player) {
      throw new Error('This action cannot be run by player');
    }
    with(this.entity.get('Cdamage')) {
      this.result = health;
      health = maxHealth;
    }
  }
});

domain.assign('AhealthDiff', {
  depends: ['Cdamage'],
  internal: true,
  run: function() {
    if(this.player) {
      throw new Error('This action cannot be run by player');
    }
    if(!this.args) {
      throw new Error('Arguments not set');
    }
    this.result = this.entity.get('Cdamage').health;
    this.entity.get('Cdamage').health += this.args;
    if(this.entity.get('Cdamage').health <= 0) {
      if(this.session.isServer) this.session.runAction(new Action('Adeath', this.session, null, this.entity));
    }
  }
});

domain.assign('SinitHealth', {
  system: 100,
  init: function(session) {
    if(!session.isServer) return;
    session.map.forEachByComponents(['Cdamage'], function(entity) {
      if(entity.get('Cdamage').health != entity.get('Cdamage').maxHelath) {
        session.runAction(new Action('AhealthHeal', session, null, entity));
      }
    });
  }
});

domain.assign('Afortify', {
  depends: ['Cown', 'Cmove', 'Cdamage'],
  run: function() {
    if(this.entity.get('Cown').player != this.player.id) {
      throw new Error('That is not your entity.');
    }
    if(this.entity.get('Cmove') && this.entity.get('Cmove').move <= 0) {
      throw new Error('That entity is tired');
    }
    this.result = this.entity.get('Cdamage').fortify;
    if(this.args) {
      this.entity.get('Cdamage').fortify = true;
    } else {
      this.entity.get('Cdamage').fortify = false;
    }
  }
});

domain.assign('Asuicide', {
  depends: ['Cown', 'Cdamage'],
  debug: true,
  run: function() {
    if(this.entity.get('Cown').player != this.player.id) {
      throw new Error('That is not your entity.');
    }
    this.result = this.entity.get('Cdamage').health;
    this.entity.get('Cdamage').health = 0;
    if(!this.session.isServer) return;
    this.session.runAction(new Action('Adeath', this.session, null, this.entity));
  }
});

domain.assign('Adeath', {
  depends: ['Cpos', 'Cdamage'],
  internal: true,
  run: function() {
    if(this.player) {
      throw new Error('This action cannot be run by player');
    }
    // 지도에서 엔티티를 삭제함 
    var tile = this.session.map.getTile(this.entity.get('Cpos'));
    tile.children.splice(tile.children.indexOf(this.entity), 1);
    
    this.result = true;
  }
});


// Aattack
domain.assign('Cattack', {
  attack: 0,
  attackRandomness: 0,
  range: 0,
  bonus: {
    other_fly_melee_first: {
      attack: 0
    }
  }
});

domain.assign('Aattack', {
  depends: ['Cattack', 'Cown'],
  debug: true,
  run: function() {
    if(this.entity.get('Cown').player != this.player.id) {
      throw new Error('That is not your entity.');
    }
    if(this.entity.get('Cdamage') && this.entity.get('Cdamage').fortify) {
      throw new Error('That entity is in fortify state');
    }
    if(this.entity.get('Cmove') && this.entity.get('Cmove').move <= 0) {
      throw new Error('That entity is tired');
    }
    var target = this.session.map.searchEntity(this.args);
    if(!target) {
      throw new Error('Entity is unknown');
    }
    if(!target.get('Cdamage')) {
      throw new Error('That entity is not attackable');
    }
    if(!target.get('Cpos')) {
      throw new Error('That entity has no position');
    }
    var distance = domain.get('LhexDist')(this.entity.get('Cpos'), target.get('Cpos'));
    var melee = distance <= 1;
    if(distance > this.entity.get('Cattack').range) {
      throw new Error('Distance too far');
    }
    if(this.session.isServer) {
      // 전투 전 체력 기록
      this.result = {
        previous: {self: this.entity.get('Cdamage').health,
          target: target.get('Cdamage').health
        }
      };
    }
    if(this.session.isServer) {
      // TODO 전투 알고리즘은 여기에
      target.get('Cdamage').health -= attackEntity(this.entity, target, true);
    } else {
      target.get('Cdamage').health = this.result.current.target;
    }
    // 만약 상대방이 반격하는 놈이라면
    if(target.get('Cattack') && melee) {
      if(this.session.isServer) {
        this.entity.get('Cdamage').health -= attackEntity(target, this.entity, false);
      } else {
        this.entity.get('Cdamage').health = this.result.current.self;
      }
    }
    // 기동력 0으로
    if(this.entity.get('Cmove')) {
      this.entity.get('Cmove').move = 0;
    }
    if(this.entity.get('Cpower')) {
      this.entity.get('Cpower').power -= this.entity.get('Cpower').consume;
    }
    // 죽음 처리
    if(target.get('Cdamage').health <= 0) {
      if(this.session.isServer) this.session.runAction(new Action('Adeath', this.session, null, target));
    }
    if(this.entity.get('Cdamage').health <= 0) {
      if(this.session.isServer) this.session.runAction(new Action('Adeath', this.session, null, this.entity));
    }
    if(this.session.isServer) {
      this.result.current = {
        self: this.entity.get('Cdamage').health,
        target: target.get('Cdamage').health
      };
    }
  }
});
