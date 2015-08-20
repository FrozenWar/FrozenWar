import {Component, Action} from 'ecstasy';

export class AttackComponent extends Component {
  constructor(options) {
    super();
    this.attack = options.attack || 0;
    this.range = options.range || 0;
    this.effects = options.effects || {};
    this.noRegular = options.noRegular || false;
    this.types = options.types;
  }

  static get key() {
    return 'attack';
  }
}

export class AttackAction extends Action {
  run(engine) {
    if (this.entity.c('move').move <= 0) {
      throw new Error('Entity is tired');
    }
    if (!this.options || this.options.target == null) {
      throw new Error('No target is specified');
    }
    // Select attack method.
    let attack = this.entity.c('attack');
    if (this.options.type != null && this.options.type !== -1) {
      attack = attack.types[this.options.type];
      if (attack == null) {
        throw new Error('Cannot find specified attack method');
      }
    } else if (attack.noRegular) {
      throw new Error('Cannot attack with regular attack');
    }
    // Find target entity.
    // There is no guarantee that target is a number,
    // so it'd be better to avoid engine.e()
    let target = engine.getEntity(this.options.target);
    if (!target) throw new Error('Cannot find target');
    if (!target.c('damage')) throw new Error('Cannot attack target');
    if (!target.c('pos')) throw new Error('Target has no position');
    // Validate distance.
    let distance = this.entity.c('pos').distance(target.c('pos'));
    let melee = distance <= 1;
    if (distance > attack.range) {
      throw new Error('Entity cannot reach target');
    }
    if (engine.isServer) {
      // Calculate attack damage, etc;
      let targetAttack;
      if (target.c('attack') & melee) targetAttack = target.c('attack');
      let entityMod = engine.s('effect').calcAttack(attack.effects, this.entity,
        target, true, distance).modifier;
      let targetMod = engine.s('effect').calcAttach(targetAttack.effects,
        target, this.entity, false, distance).modifier;
      engine.s('effect').applyEach(entityMod, targetMod);
      // Calculate damage and apply to target
      // Damage applied to target
      let targetDamage = this.calcDamage(attack, target.c('damage')
        , entityMod, targetMod);
      // Damage applied to entity
      let entityDamage = 0;
      if (targetAttack && melee) {
        entityDamage = this.calcDamage(targetAttack, this.entity.c('damage')
          , targetMod, entityMod);
      }
      // Set result
      this.result = {
        target: targetDamage,
        entity: entityDamage
      };
      // Decrease health
      target.c('damage').health -= targetDamage;
      this.entity.c('damage').health -= entityDamage;
    } else {
      // Set health thrown from the server
      target.c('damage').health -= this.result.target;
      this.entity.c('damage').health -= this.result.entity;
    }
    // Set move strength to 0
    this.entity.c('move').move = 0;
    // TODO Decrease power
    // Handle death
    if (engine.isServer) {
      if (this.entity.c('damage').health <= 0) {
        engine.aa('death', this.entity, null, null);
      }
      if (target.c('damage').health <= 0) {
        engine.aa('death', target, null, null);
      }
    }
  }

  calcDamage(attack, otherDamage, selfMod, otherMod) {
    // Calculate attack strength
    let attackDmg = attack.attack + (Math.random() * (attack.attackRand || 0));
    let defense = otherDamage.defense;
    attackDmg *= selfMod.attack;
    defense *= otherMod.defense;
    return Math.max(0, attackDmg - defense | 0);
  }

  static get depends() {
    return ['attack', 'damage', 'move', 'pos'];
  }

  static get key() {
    return 'attack';
  }
}
