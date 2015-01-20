domain.assign('Cmagic', {
  consume: 5
});

domain.assign('SmagicFall', {
  system: 9000,
  turn: function(session) {
    if(!session.isServer) return;
    session.map.forEachByComponents(['Cpower', 'Cmagic', 'Cdamage'], function(entity) {
      if(entity.get('Cdamage').fortify && entity.get('Cpower').power > 0) {
        session.runAction(new Action('ApowerHeal', session, null, 
          entity, -entity.get('Cmagic').consume));
      }
    });
  }
});
