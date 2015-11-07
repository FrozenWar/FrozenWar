export default function log(engine, action, next) {
  // TODO should be changed to 'debug'
  console.log(action);
  return next(action);
}
