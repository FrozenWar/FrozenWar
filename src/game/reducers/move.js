import spawn from './spawn.js';
import { MOVE } from '../actions/pos.js';
import { NEXT, INIT } from '../actions/turn.js';

export default function move(state = {}, action, root) {
  state = spawn('move', state, action, root);
  const { type, payload } = action;
  switch (type) {
  case MOVE:
    const move = state[payload.id];
    if (move == null) return state;
    move.step -= payload.move && payload.move.cost;
    return state;
  case INIT:
  case NEXT:
    // Alter every entity
    // TODO this should be done every sequence, not turn.
    for (let key in state) {
      state[key].step = state[key].maxStep;
    }
  }
  return state;
}
