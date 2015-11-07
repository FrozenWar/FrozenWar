import { SPAWN } from '../actions/spawn.js';

export default function spawn(engine, action, next) {
  if (action.type !== SPAWN) return next(action);
  let { id } = engine.getState();
  return next(Object.assign({}, action, {
    payload: Object.assign({}, action.payload, {
      id: id.last
    })
  }));
}
