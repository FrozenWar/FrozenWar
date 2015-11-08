import { SPAWN, SPAWN_TEMPLATE, spawn as spawnAction }
  from '../actions/spawn.js';
import getTemplate, { deepCopy } from '../utils/spawnTemplate.js';

export default function spawn(engine, action, next) {
  if (action.type !== SPAWN) return next(action);
  let { id } = engine.getState();
  return next(Object.assign({}, action, {
    payload: Object.assign({}, action.payload, {
      id: id.last
    })
  }));
}

export function spawnTemplate(engine, action, next) {
  const { type, payload } = action;
  if (type !== SPAWN_TEMPLATE) return next(action);
  let template = getTemplate(payload.template);
  if (payload.override) {
    deepCopy(template, payload.override);
  }
  return engine.dispatch(spawnAction(template));
}
