import assert from 'assert';

import buildEngine from '../../src/game/init.js';

let engine, player;
beforeEach(() => {
  engine = buildEngine(true);
  // Doing this because we need to have at least one player in the game
  player = engine.e({
    player: {
      name: 'test'
    }
  });
});

// This will spawn 'TestEntity' and 'BaseEntity' for testing
describe('SpawnAction', () => {
  it('should be present', () => {
    assert(engine.getActionConstructor('spawn'));
  });
  it('should not be run by players', () => {
    assert.throws(() => {
      engine.aa('spawn', null, player, {
        type: 'TestEntity',
        player: player.id,
        x: 3,
        y: 3
      });
    }, 'Players cannot run this action');
  });
  it('should return ID of new entity', () => {
    let action = engine.aa('spawn', null, null, {
      type: 'TestEntity',
      player: player.id,
      x: 3,
      y: 3
    });
    assert(action);
    assert.equal(action.result, 1);
  });
  it('should set owner id and pos', () => {
    let action = engine.aa('spawn', null, null, {
      type: 'TestEntity',
      player: player.id,
      x: 3,
      y: 3
    });
    assert(action);
    assert.equal(engine.e(action.result).c('owner').id, player.id);
    assert.equal(engine.e(action.result).c('pos').x, 3);
    assert.equal(engine.e(action.result).c('pos').y, 3);
  });
  it('should handle ownerless entities', () => {
    let action = engine.aa('spawn', null, null, {
      type: 'TestEntity',
      x: 0,
      y: 0
    });
    assert(action);
    assert.equal(engine.e(action.result).c('owner'), null);
  });
});
