import id from './id.js';
import spawn from './spawn.js';
import owner from './owner.js';
import pos from './pos.js';
import posIndex from './posIndex.js';
import move from './move.js';
import turn from './turn.js';

const info = spawn.bind(null, 'info');
const player = spawn.bind(null, 'player');

export { id, info, owner, player, posIndex, pos, move, turn };
