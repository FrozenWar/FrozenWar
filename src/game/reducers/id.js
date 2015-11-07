import { SPAWN } from '../actions/spawn.js';

export default function id(state = { last: 0 }, action) {
  const { payload, type } = action;
  switch (type) {
  case SPAWN:
    if (payload && payload.id != null) {
      state.last = payload.id + 1;
    }
    return state;
  }
  return state;
}
