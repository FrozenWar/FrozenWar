// SupdateAttack
domain.assign('Cpower', {
  power: 0,
  maxPower: 0,
  consume: 0,
  heal: 10
});

domain.assign('SpowerBonusUpdate', {
  system: 10000,
  action: function(session) {
    session.map.forEachByComponents(['Cpower', 'Cattack'], function(entity) {
      var percentage = entity.get('Cpower').power / entity.get('Cpower').maxPower;
      entity.get('Cattack').bonus.power = {
        attack: percentage
      }
    });
  }
});

domain.assign('SpowerHeal', {
  system: 95,
  turn: function(session) {
    if(!session.isServer) return;
    session.map.forEachByComponents(['Cpower', 'Cmove'], function(entity) {
      if(entity.get('Cmove').move == entity.get('Cmove').maxMove) {
        session.runAction(new Action('ApowerHeal', session, null, 
          entity, entity.get('Cpower').heal));
      }
    });
  }
});

domain.assign('SinitPower', {
  system: 100,
  init: function(session) {
    if(!session.isServer) return;
    session.map.forEachByComponents(['Cpower'], function(entity) {
      if(entity.get('Cpower').power != entity.get('Cpower').maxPower) {
        session.runAction(new Action('ApowerHeal', session, null, entity, entity.get('Cpower').maxPower));
      }
    });
  }
});

domain.assign('ApowerHeal', {
  depends: ['Cpower'],
  run: function() {
    if(this.player) {
      throw new Error('This action cannot be run by player');
    }
    if(!this.args) {
      throw new Error('Argument not set');
    }
    with(this.entity.get('Cpower')) {
      this.result = power;
      power += this.args;
      power = Math.min(power, maxPower);
    }
  }
});

domain.assign('Cability', {
});
