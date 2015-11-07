const combineSystems = systems => (state = {}, action, root) => {
  for (let key in systems) {
    state[key] = systems[key](state[key], action, root);
  }
  return state;
};

export default function createStore(middlewares, systems) {
  let state = undefined;
  let combinedSystem = combineSystems(systems);
  let dispatch = action => state = combinedSystem(state, action, state);
  let returned = {
    dispatch, getState: () => state
  };
  // Combine middlewares...
  for (let middleware of middlewares.reverse()) {
    const prevDispatch = dispatch;
    dispatch = action => middleware(returned, action,
      nextAction => prevDispatch(nextAction)
    );
  }
  returned.dispatch = dispatch;
  returned.dispatch({
    type: 'ecstasy/init'
  });
  return returned;
}
