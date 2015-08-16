import {System} from 'ecstasy';

/**
 * Checks action's dependency before the action runs.
 */
export class DependencySystem extends System {
  add(engine) {
    this.engine = engine;
  }
  preAction(turn, action) {
    let entity = action.entity;
    let dependency = action.prototype.depends;
    if (dependency == null) return;
    if (entity == null) {
      throw new Error('Action has dependency but there is no entity');
    }
    dependency.forEach(depends => {
      if (entity.c(depends) == null) {
        throw new Error('Action requires ' + depends +
          ', but entity doesn\'t have one');
      }
    });
  }
  static get key() {
    return 'dependency';
  }
}
