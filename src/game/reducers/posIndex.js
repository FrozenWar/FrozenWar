// Position indexing reducer
// What does it do? It indexes position data, duh.

function getPos(data, x, y) {
  if (data[y] == null) {
    data[y] = [];
  }
  if (data[y][x] == null) {
    data[y][x] = [];
  }
  return data[y][x];
}

// Does state needs to be an array?
export default function posIndex(state = [], action, root) {
  const { payload } = action;
  // Handle movement...
  if (payload && payload.pos && payload.id != null) {
    const { id, pos } = payload;
    const prevPos = root.pos[id];
    if (prevPos) {
      // Delete entry from previous position....
      // TODO uhoh. We need priority or something.
      const prevEntities = getPos(state, prevPos.x, prevPos.y);
      prevEntities.splice(prevEntities.indexOf(id), 1);
    }
    const entities = getPos(state, pos.x, pos.y);
    entities.push(id);
  }
  return state;
}
