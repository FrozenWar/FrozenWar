export function getZ(pos) {
  return -pos.x - pos.y;
}

export function distance(a, b) {
  return Math.max(Math.abs(b.x - a.x), Math.abs(getZ(b) -
    getZ(a)), Math.abs(b.y - a.y));
}
