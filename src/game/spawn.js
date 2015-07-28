import {Action, EntityBuilder} from 'ecstasy';
import * as Template from './template.json';

export class SpawnAction extends Action {
  run(engine) {
    if (this.player != null) throw new Error('Players cannot run this action');
    var template = EntityBuilder.getEntityTemplate(this.options.type, Template);
    var entity = EntityBuilder.buildEntity(engine, template);
    if (entity.c('owner')) {
      entity.c('owner').id = this.options.player;
    }
    if (entity.c('pos')) {
      if (this.options.x != null && this.options.y != null) {
        entity.c('pos').x = this.options.x;
        entity.c('pos').y = this.options.y;
      }
    }
    engine.addEntity(entity);
    this.result = entity.id;
  }
  static get key() {
    return 'spawn';
  }
}
