import id from './id.js';
import spawn from './spawn.js';
import owner from './owner.js';

const info = spawn.bind(null, 'info');
const player = spawn.bind(null, 'player');

export { id, info, owner, player };
