domain.assign('Cmove', {
  move: 0,
  maxMove: 0
});

domain.assign('Amove', {
  depends: ['Cown', 'Cmove', 'Cpos'],
  run: function() {
    if(this.entity.get('Cown').player != this.player.id) {
      throw new Error('That is not your entity.');
    }
    var requiredMoves = domain.get('LhexDist')(this.entity.get('Cpos'), this.args);
    if(requiredMoves > this.entity.get('Cmove').move) {
      throw new Error('No enough energy');
    }
    this.entity.get('Cmove').move -= requiredMoves;
    var pos = this.entity.get('Cpos');
    // 지도에서 엔티티를 삭제함
    var tile = this.session.map.getTile(pos);
    tile.children.splice(tile.children.indexOf(this.entity), 1);
    this.result = {x: pos.x, y: pos.y};
    pos.x = this.args.x;
    pos.y = this.args.y;
    // 엔티티를 지도에다 다시 넣음
    var newTile = this.session.map.getTile(pos);
    newTile.children.push(this.entity);
  }
});

domain.assign('AmoveHeal', {
  depends: ['Cmove'],
  internal: true,
  run: function() {
    if(this.player) {
      throw new Error('This action cannot be run by player');
    }
    with(this.entity.get('Cmove')) {
      this.result = move;
      move = maxMove;
    }
  }
});

domain.assign('SmoveHeal', {
  system: 1000,
  turn: function(session) {
    if(!session.isServer) return;
    session.map.forEachByComponents(['Cmove'], function(entity) {
      if(entity.get('Cmove').move != entity.get('Cmove').maxMove)
        session.runAction(new Action('AmoveHeal', session, null, entity));
    });
  }
});
