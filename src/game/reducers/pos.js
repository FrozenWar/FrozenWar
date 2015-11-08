import spawn from './spawn.js';
import { MOVE } from '../actions/pos.js';

export default function pos(state = {}, action, root) {
  state = spawn('pos', state, action, root);
  const { type, payload } = action;
  switch (type) {
  case MOVE:
    state[payload.id] = payload.pos;
    return state;
  }
  return state;
}
