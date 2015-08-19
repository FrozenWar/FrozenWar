import {System} from 'ecstasy';

export default class AttackStatusSystem extends System {
  add(engine) {
    this.engine = engine;
    this.list = AttackStatusSystem.getList();
  }

  applyOther(origin, target) {
    for (let key in origin) {
      if (key.slice(0, 6) !== 'other-') continue;
      let origKey = key.slice(6);
      if (target[origKey] == null) target[origKey] = 1;
      target[origKey] *= origin[key];
    }
  }

  applyEach(mod1, mod2) {
    this.applyOther(mod1, mod2);
    this.applyOther(mod2, mod1);
  }

  calculate(status, entity, opponent, first) {
    let modifier = {};
    for (let name in status) {
      if (this.list[name](this.engine, entity, opponent, first)) {
        // Apply modifier.
        this.applyModifier(modifier, status[name]);
      }
    }
    return modifier;
  }

  applyModifier(target, modifier) {
    for (let key in modifier) {
      if (target[key] == null) target[key] = 1;
      target[key] *= modifier[key];
    }
  }

  addStatus(name, check) {
    this.list[name] = check;
  }

  static getList() {
    if (AttackStatusSystem.list == null) AttackStatusSystem.list = {};
    return AttackStatusSystem.list;
  }

  static addStatus(name, check) {
    let list = AttackStatusSystem.getList();
    list[name] = check;
  }

  static get key() {
    return 'status';
  }
}

// Default statuses
AttackStatusSystem.addStatus('first', (engine, entity, opponent, first) => {
  return first;
});

AttackStatusSystem.addStatus('counter', (engine, entity, opponent, first) => {
  return !first;
});
