domain.assign('Cfly', {
  fly: false,
  consume: 5
});

domain.assign('SflyFall', {
  system: 9000,
  turn: function(session) {
    if(!session.isServer) return;
    session.map.forEachByComponents(['Cpower', 'Cfly'], function(entity) {
      if(entity.get('Cfly').fly) {
        session.runAction(new Action('ApowerHeal', session, null, 
          entity, -entity.get('Cfly').consume));
      }
      if(entity.get('Cpower').power < 0 && entity.get('Cfly').fly) {
        session.runAction(new Action('AtoggleFly', session, null, entity, false));
        // 데미지 계산: -날개력 * 5
        session.runAction(new Action('AhealthDiff', session, null, entity, entity.get('Cpower').power * 5));
      }
    });
  }
});

domain.assign('AtoggleFly', {
  depends: ['Cfly', 'Cpower'],
  run: function() {
    if(this.player && this.entity.get('Cown').player != this.player.id) {
      throw new Error('That is not your entity.');
    }
    if(this.args) {
      if(this.entity.get('Cpower') && this.entity.get('Cpower').power < this.entity.get('Cfly').consume) {
        throw new Error('That entity is tired');
      }
      this.entity.get('Cfly').fly = true;
    } else {
      this.entity.get('Cfly').fly = false;
    }
    this.result = this.entity.get('Cfly').fly;
  }
});
