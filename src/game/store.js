import createStore from './lib/createStore.js';
import middlewares from './middlewares/index.js';
import * as reducers from './reducers/index.js';

export default function configureStore() {
  const store = createStore(middlewares, reducers);
  console.log(store.getState());
  return store;
}
