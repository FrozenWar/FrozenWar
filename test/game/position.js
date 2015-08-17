import assert from 'assert';
import {Action} from 'ecstasy';

import buildEngine from '../../src/game/init.js';

let engine;
beforeEach(() => {
  engine = buildEngine(true);
  // Doing this because we need to have at least one player in the game
  engine.e()
  .c('player', {
    name: 'test'
  });
});

describe('PositionSystem', () => {
  it('should be present', () => {
    assert(engine.s('pos'));
  });
  it('should add entity to right pos', () => {
    engine.e()
    .c('pos', {
      x: 3,
      y: 4
    });
    assert.equal(engine.s('pos').get(3, 4).length, 1);
  });
  it('should clear map if requested', () => {
    engine.e()
    .c('pos', {
      x: 3,
      y: 4
    });
    assert.equal(engine.s('pos').get(3, 4).length, 1);
    engine.s('pos').clear();
    // TODO Not sure if this is intended, because it should add all
    // the entities in engine
    assert.equal(engine.s('pos').get(3, 4).length, 0);
  });
  it('should throw an error if out of bounds', () => {
    assert.throws(() => {
      engine.e()
      .c('pos', {
        x: 512,
        y: 127
      });
    }, 'Entity out of bounds');
  });
  it('should return null if out of bounds', () => {
    assert.equal(engine.s('pos').get(127, 512), null);
  });
  it('should remove from the map if entity is removed', () => {
    let entity = engine.e()
    .c('pos', {
      x: 3,
      y: 4
    });
    assert.equal(engine.s('pos').get(3, 4).length, 1);
    engine.removeEntity(entity);
    assert.equal(engine.s('pos').get(3, 4).length, 0);
  });
  it('should remove from the map if component is removed', () => {
    let entity = engine.e()
    .c('pos', {
      x: 3,
      y: 4
    });
    assert.equal(engine.s('pos').get(3, 4).length, 1);
    entity.remove('pos');
    assert.equal(engine.s('pos').get(3, 4).length, 0);
  });
  it('should reindex entity if requested', () => {
    let entity = engine.e()
    .c('pos', {
      x: 3,
      y: 4
    });
    assert.equal(engine.s('pos').get(5, 3).length, 0);
    assert.equal(engine.s('pos').get(3, 4).length, 1);
    let pos = entity.c('pos');
    pos.x = 5;
    pos.y = 3;
    engine.s('pos').updateEntity(entity);
    assert.equal(engine.s('pos').get(5, 3).length, 1);
    assert.equal(engine.s('pos').get(3, 4).length, 0);
  });
  it('should throw error if action did not call update', () => {
    // In here, we're using 'function' because we need
    // seperate 'this' in the function.
    engine.a('test', Action.scaffold(function() {
      // Just modify entity in here
      this.entity.c('pos').x = 8;
    }));
    let entity = engine.e()
    .c('pos', {
      x: 3,
      y: 4
    });
    assert.throws(() => {
      engine.aa('test', entity, null, null);
    }, 'Entity did not notify its position to PositionSystem');
  });
});

describe('PositionComponent', () => {
  let PosComp;
  beforeEach(() => {
    PosComp = engine.getComponentConstructor('pos');
  });
  it('should be present', () => {
    assert(PosComp);
  });
  it('should return correct Z value', () => {
    let comp = new PosComp({
      x: 3, y: -1
    });
    assert.equal(comp.getZ(), -2);
  });
  it('should return correct distance', () => {
    let origin = new PosComp({x: 3, y: -1});
    assert.equal(origin.distance(new PosComp({x: 3, y: -1})), 0);
    assert.equal(origin.distance(new PosComp({x: 2, y: 1})), 2);
  });
});
