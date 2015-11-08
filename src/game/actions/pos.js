import { createAction } from 'redux-actions';

export const MOVE = 'position/move';

export const move = createAction(MOVE, (id, x, y) => ({
  id, pos: { x, y }
}), (_0, _1, _2, forced) => ({ forced }));
