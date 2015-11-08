import { NEXT, INIT } from '../actions/turn.js';

export default function turn(state = {
  id: 0, order: 0, sequence: 0, player: -1
}, action, root) {
  const { type } = action;
  const players = root && root.player && Object.keys(root.player);
  switch (type) {
  case NEXT:
    state.id ++;
    state.order ++;
    if (state.order >= players.length) {
      state.order = 0;
      state.sequence ++;
    }
    state.player = parseInt(players[state.order]);
    return state;
  case INIT:
    if (state.player !== -1) throw new Error('Turn already started');
    if (players.length === 0) {
      throw new Error('There should be at least one player');
    }
    state.player = parseInt(players[0]);
    return state;
  }
  return state;
}
