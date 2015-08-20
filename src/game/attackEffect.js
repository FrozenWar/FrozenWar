import {System} from 'ecstasy';

export default class AttackEffectSystem extends System {
  add(engine) {
    this.engine = engine;
    this.list = AttackEffectSystem.getList();
    this.default = AttackEffectSystem.getDefault();
  }

  calcAttack(attackType, entity, opponent, first, dist) {
    let mod = {};
    let list = [];
    this.calculate(this.default, entity, opponent, first, dist, mod, list);
    this.calculate(first.c('damage').effects, entity, opponent,
      first, dist, mod, list);
    this.calculate(attackType, entity, opponent, first, dist, mod, list);
    return {
      modifier: mod,
      list: list
    };
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

  calculate(status, entity, opponent, first, dist, modifier = {}, list) {
    if (status == null) return modifier;
    for (let name in status) {
      if (this.list[name] == null) continue;
      if (this.list[name](this.engine, entity, opponent, first, dist)) {
        if (list) {
          if (list[name] == null) list[name] = {};
          this.applyModifier(list[name], status[name]);
        }
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

  static applyDefault(modifier) {
    let target = AttackEffectSystem.getDefault();
    for (let key in modifier) {
      if (target[key] == null) target[key] = 1;
      target[key] *= modifier[key];
    }
  }

  static getList() {
    if (AttackEffectSystem.list == null) AttackEffectSystem.list = {};
    return AttackEffectSystem.list;
  }

  static addStatus(name, check) {
    let list = AttackEffectSystem.getList();
    list[name] = check;
  }

  static getDefault() {
    if (AttackEffectSystem.default == null) AttackEffectSystem.default = {};
    return AttackEffectSystem.default;
  }

  static get key() {
    return 'effect';
  }
}

AttackEffectSystem.applyDefault({
  attack: 1,
  defense: 1
});

// Default statuses
AttackEffectSystem.addStatus('first', (engine, entity, opponent, first) => {
  return first;
});

AttackEffectSystem.addStatus('counter', (engine, entity, opponent, first) => {
  return !first;
});
