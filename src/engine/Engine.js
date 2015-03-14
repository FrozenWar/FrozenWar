var BitSet = require('./BitSet.js');
var EventEmitter = require('./EventEmitter.js');

var DEFAULT_SYSTEM_PRIORITY = 1000;

/**
 * 반환되는 이벤트 목록
 * entityAdded
 */

function Engine() {
  EventEmitter.call(this);
  this._entities = {};
  this._entitiesArray = [];
  this._entityPos = 0;
  this._components = [];
  this._componentPos = 0;
  this._componentGroups = [];
  this._componentGroupEntities = [];
  this.systems = [];
  this._systemPos = 0;
  this._systemsSortRequired = false;
}

Engine.prototype = Object.create(EventEmitter.prototype);
Engine.prototype.constructor = Engine;

/**
 * Engine에 Component 클래스를 등록합니다.
 */
Engine.prototype.registerComponent = function(component) {
  if(this._components.indexOf(component) != -1) return;
  // TODO 전역상수는 디버그용
  component.bitIndex = this._componentPos;
  this._components.push(component);
  return this._componentPos ++;
}

/**
 * Component의 비트 위치를 반환합니다.
 */
Engine.prototype.getComponentBit = function(component) {
  var bitPos = this._components.indexOf(component);
  if(bitPos == -1) {
    return this.registerComponent(component);
  } else {
    return bitPos;
  }
}

/**
 * Component들의 비트를 반환합니다.
 */
Engine.prototype.getComponentsBitSet = function(components) {
  var bits = new BitSet();
  for(var i = 0; i < components.length; ++i) {
    bits.set(this.getComponentBit(components[i]), true);
  }
  return bits;
}

Engine.prototype.obtainEntityId = function() {
  return this._entityPos ++;
}

Engine.prototype.addEntity = function(entity) {
  entity.id = this.obtainEntityId();
  entity._engine = this;
  this._entities[entity.id] = entity;
  this._entitiesArray.push(entity);
  this.emit('entityAdded', entity);
  this.updateComponentGroup(entity);
  entity.on('componentAdded', this.updateComponentGroup);
  entity.on('componentRemoved', this.updateComponentGroup);
}

Engine.prototype.removeEntity = function(entity) {
  var entityPos = this._entitiesArray.indexOf(entity);
  if(entityPos == -1) return;
  delete this._entities[entity.id];
  this._entitiesArray.splice(entityPos, 1);
  this.emit('entityRemoved', entity);
  entity.removeListener('componentAdded', this.updateComponentGroup);
  entity.removeListener('componentRemoved', this.updateComponentGroup);
  // TODO 최적화
  for(var i = 0; i < this._componentGroups.length; ++i) {
    var componentGroup = this._componentGroups[i];
    if(entity.componentGroupBits.get(componentGroup.id)) {
      var componentEntities = this._componentGroupEntities[i];
      componentEntities.splice(componentEntities.indexOf(entity), 1);
      componentGroup.emit('entityRemoved', entity);
    }
  }
}

Engine.prototype.removeAllEntities = function(entity) {
  while(this._entitiesArray.length > 0) {
    this.removeEntity(this._entitiesArray[0]);
  }
}

Engine.prototype.getEntity = function(id) {
  return this._entities[id];
}

Engine.prototype.getEntities = function() {
  return this._entitiesArray;
}

Engine.prototype.updateComponentGroup = function(entity) {
  for(var i = 0; i < this._componentGroups.length; ++i) {
    var componentGroup = this._componentGroups[i];
    if(componentGroup.matches(entity)) {
      if(!entity.componentGroupBits.get(componentGroup.id)) {
        // 추가
        entity.componentGroupBits.set(componentGroup.id, true);
        this._componentGroupEntities[i].push(entity);
        componentGroup.emit('entityAdded', entity);
      }
    } else {
      if(entity.componentGroupBits.get(componentGroup.id)) {
        // 삭제
        entity.componentGroupBits.set(componentGroup.id, false);
        var componentEntities = this._componentGroupEntities[i];
        componentEntities.splice(componentEntities.indexOf(entity), 1);
        componentGroup.emit('entityRemoved', entity);
      }
    }
  }
}

Engine.prototype.registerComponentGroup = function(componentGroup) {
  for(var i = 0 ; i < this._componentGroups.length; ++i) {
    if(this._componentGroups[i].equals(componentGroup)) {
      return this._componentGroupEntities[i];
    }
  }
  if(componentGroup.id != null && 
      this._componentGroups[componentGroup.id] == componentGroup) {
    return this._componentGroupEntities[componentGroup.id];
  }
  componentGroup.id = this._componentGroups.length;
  componentGroup._engine = this;
  this._componentGroups.push(componentGroup);
  var componentGroupEntity = [];
  this._componentGroupEntities.push(componentGroupEntity);
  // initialize componentGroup array
  this.getEntities().forEach(function(entity) {
    if(componentGroup.matches(entity)) {
      // 추가
      entity.componentGroupBits.set(componentGroup.id, true);
      componentGroup.push(entity);
      componentGroup.emit('entityAdded', entity);
    }
  });
  return componentGroupEntity;
}

Engine.prototype.getEntitiesFor = function(componentGroup) {
  return this.registerComponentGroup(componentGroup);
}

Engine.prototype.addSystem = function(system) {
  if(this.systems.indexOf(system) != -1) return;
  system._id = this._systemPos ++;
  this.systems.push(system);
  if(typeof system.onAddedToEngine == 'function') {
    system.onAddedToEngine(this);
  }
  if(system.priority == null) {
    system.priority = DEFAULT_SYSTEM_PRIORITY;
  }
  system.engine = this;
  this._systemsSortRequired = true;
}

Engine.prototype.removeSystem = function(system) {
  var systemPos = this.systems.indexOf(system);
  if(systemPos == -1) return;
  this.systems.splice(systemPos, 1);
  if(typeof system.onRemovedFromEngine == 'function') {
    system.onRemovedFromEngine(this);
  }
}

Engine.prototype.sortSystems = function() {
  if(this._systemsSortRequired) {
    this.systems.sort(function(a, b) {
      if(a.priority > b.priority) {
        return 1;
      } else if(a.priority < b.priority) {
        return -1;
      } else {
        if(a._id > b._id) {
          return 1;
        } else if(a._id < b._id) {
          return -1;
        } else {
          return 0;
        }
      }
    });
    this._systemsSortRequired = false;
  }
}

Engine.prototype.update = function() {
  this.sortSystems();
  this.systems.forEach(function(system) {
    if(system.update) {
      system.update();
    }
  })
}

if(typeof module != 'undefined') {
  module.exports = Engine;
}
