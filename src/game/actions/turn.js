import { createAction } from 'redux-actions';

export const NEXT = 'ecstasy/turn-next';
export const INIT = 'ecstasy/turn-init';

export const next = createAction(NEXT);
export const init = createAction(INIT);
