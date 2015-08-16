import assert from 'assert';

import {TurnEngine} from 'ecstasy';
import buildEngine from '../../src/game/init.js';

describe('init', () => {
  let engine;
  beforeEach(() => {
    engine = buildEngine(true);
  });
  it('should return valid engine object', () => {
    assert(engine instanceof TurnEngine);
  });
  it('should set isServer correctly', () => {
    assert.equal(engine.isServer, true);
    let clientEngine = buildEngine(false);
    assert.equal(clientEngine.isServer, false);
  });
});
