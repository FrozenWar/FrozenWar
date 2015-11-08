// Validates action request and denies if turn is not their turn
export default function turn(engine, action, next) {
  const { meta } = action;
  // Allow everything if this is running from the server.
  if (!meta || meta.player == null) {
    return next(action);
  }
  const { turn } = engine.getState();
  if (turn.player !== meta.player) {
    throw new Error('Cannot dispatch action in other user\'s turn');
  }
  return next(action);
}
