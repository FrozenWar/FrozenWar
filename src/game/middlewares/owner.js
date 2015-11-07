// Validates action request and denies if permission is not permitted
export default function owner(engine, action, next) {
  const { payload, meta } = action;
  // Allow everything if this is running from the server.
  if (!meta || meta.player == null) {
    return next(action);
  }
  // If the action specifies a target entity
  if (payload.id != null) {
    const owner = engine.getState().owner[payload.id];
    // If owner is 'undefined', this means entity has no owner.
    // Still, that's not authorized to run by a player.
    if (owner !== meta.player) {
      // This operation is not permitted; throw an error.
      throw new Error('Tried to alter other user\'s entity by other user.');
    }
    // Or, continue.
    return next(action);
  } else {
    // Otherwise, continue.
    return next(action);
  }
}
