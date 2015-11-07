import spawn from './spawn.js';
import { TRANSFER } from '../actions/owner.js';

export default function owner(state = {}, action, root) {
  state = spawn('owner', state, action, root);
  const { type, payload } = action;
  switch (type) {
  case TRANSFER:
    state[payload.id] = payload.owner;
    return state;
  }
  return state;
}
