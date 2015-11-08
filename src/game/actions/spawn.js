import { createAction } from 'redux-actions';

export const SPAWN = 'ecstasy/spawn';
export const SPAWN_TEMPLATE = 'ecstasy/spawn-template';

export const spawn = createAction(SPAWN);
export const spawnTemplate = createAction(SPAWN_TEMPLATE,
  (template, override) => ({template, override})
);
