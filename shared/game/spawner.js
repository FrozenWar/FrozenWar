domain.assign('Cspawn', {
  supply: 0,
  troops: 0
});
// Aspawn
domain.assign('Cspawner', {
  spawnable: [],
  range: 0
});

domain.assign('AspawnerSpawn', {
  depends: ['Cown', 'Cspawner', 'Cpos'],
  run: function() {
    if(this.entity.get('Cown').player != this.player.id) {
      throw new Error('That is not your entity.');
    }
    var requiredMoves = domain.get('LhexDist')(this.entity.get('Cpos'), this.args.pos);
    if(requiredMoves > this.entity.get('Cspawner').range) {
      throw new Error('Range too far');
    }
    if(this.entity.get('Cspawner').spawnable.indexOf(this.args.domain) == -1) {
      throw new Error('You cannot spawn that entity.');
    }
    if(domain.get(this.args.domain)['Cspawn']) {
      if(this.player.resources['troops'] < domain.get(this.args.domain)['Cspawn'].troops) {
        throw new Error('Not enough troops');
      }
      if(this.player.resources['supply'] < domain.get(this.args.domain)['Cspawn'].supply) {
        throw new Error('Not enough supply');
      }
      // Price check
      this.player.resources['troops'] -= domain.get(this.args.domain)['Cspawn'].troops;
      this.player.resources['supply'] -= domain.get(this.args.domain)['Cspawn'].supply;
    }
    if(!this.session.isServer) return;
    var resultAction = this.session.runAction(new Action('AspawnRaw', this.session, null, null, {
      x: this.args.pos.x,
      y: this.args.pos.y,
      domain: this.args.domain,
      player: this.player.id
    }));
    var resultEntity = this.session.map.searchEntity(resultAction.result);
    if(resultEntity.get('Cdamage')) {
      this.session.runAction(new Action('AhealthHeal', this.session, null,
        resultEntity));
    }
    if(resultEntity.get('Cpower')) {
      this.session.runAction(new Action('ApowerHeal', this.session, null,
        resultEntity, resultEntity.get('Cpower').maxPower));
    }
    this.result = resultAction.result;
  }
});

domain.assign('AspawnRaw', {
  run: function() {
    if(this.player) {
      throw new Error('This action cannot be run by player');
    }
    if(!this.args) {
      throw new Error('args not set');
    }
    var entity;
    if(this.session.isServer) entity = this.session.spawnEntity(this.args.domain);
      else entity = this.session.spawnEntity(this.args.domain, this.result);
    var tile = this.session.map.getTile(new Point(this.args.x, this.args.y));
    tile.children.push(entity);
    entity.get('Cpos').x = tile.position.x;
    entity.get('Cpos').y = tile.position.y;
    if(entity.get('Cown')) {
      entity.get('Cown').player = this.args.player;
    }
    this.result = entity.id;
  }
});
