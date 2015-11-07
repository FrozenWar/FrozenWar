import { SPAWN } from '../actions/spawn.js';

export default function spawn(name, state = {}, action) {
  const { payload, type } = action;
  switch (type) {
  case SPAWN:
    if (payload && payload[name]) {
      state[payload.id] = payload[name];
    }
    return state;
  }
  return state;
}
