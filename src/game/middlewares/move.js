import { MOVE } from '../actions/pos.js';
import { distance } from '../utils/pos.js';

export default function move(engine, action, next) {
  const { type, payload, meta } = action;
  if (type !== MOVE) return next(action);
  if (meta && meta.forced) return next(action);
  if (payload == null && payload.id == null) {
    throw new Error('You must specify entity');
  }
  const pos = engine.getState().pos[payload.id];
  const move = engine.getState().move[payload.id];
  // Should we allow moving 'unmovable' entity? Absolutely not.
  if (pos == null || move == null) {
    throw new Error('Choosen entity cannot move');
  }
  const cost = distance(pos, payload.pos);
  if (cost > move.step) {
    // Nope.
    throw new Error('Choosen entity is tired to move to there');
  }
  return next(Object.assign({}, action, {
    payload: Object.assign({}, action.payload, {
      move: Object.assign({}, action.payload.move, {
        cost
      })
    })
  }));
}
