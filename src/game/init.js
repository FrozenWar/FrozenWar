import debug from 'debug';
import {TurnEngine, Action, Component, System} from 'ecstasy';
let log = debug('app:init');

function discover(engine, scope) {
  for (let key in scope) {
    let value = scope[key];
    if (typeof value.key !== 'string') {
      continue;
    }
    let name = value.key;
    if (value.prototype instanceof Component) {
      log('Found component ' + name);
      engine.c(name, value);
    }
    if (value.prototype instanceof System) {
      log('Found system ' + name);
      // Doing this to avoid eslint error..
      let FoundSystem = value;
      engine.s(name, new FoundSystem());
    }
    if (value.prototype instanceof Action) {
      log('Found action ' + name);
      engine.a(name, value);
    }
  }
}

import * as Player from './player.js';
import * as Info from './info.js';
import * as Spawn from './spawn.js';
import * as Position from './position.js';
import * as Move from './move.js';

/**
 * Returns a new Engine object and registers plugins to them.
 * @param  {Boolean} isServer Whether if current target is server.
 * @return {TurnEngine} new TurnEngine object.
 */
export default function buildEngine(isServer) {
  log('Creating new engine');
  let engine = new TurnEngine(isServer);
  discover(engine, Player);
  discover(engine, Info);
  discover(engine, Spawn);
  discover(engine, Position);
  discover(engine, Move);
  return engine;
}
