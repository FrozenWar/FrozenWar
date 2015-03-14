var BitSet = require('./BitSet.js');
var EventEmitter = require('./EventEmitter.js');

function Entity(engine) {
  EventEmitter.call(this);
  // ID는 엔진이 부여
  this.id = null;
  this._engine = engine;
  this.componentBits = new BitSet();
  this.componentGroupBits = new BitSet();
  this.components = {};
  this.componentsArray = [];
}

Entity.prototype = Object.create(EventEmitter.prototype);
Entity.prototype.constructor = Entity;

/**
 * Entity에 Component를 등록합니다.
 * Component의 constructor는 Engine에 미리 등록되어 있어야 합니다.
 */
Entity.prototype.add = function(component) {
  var bitPos = this._engine.getComponentBit(component.constructor);
  this.componentBits.set(bitPos, true);
  this.components[bitPos] = component;
  this.componentsArray.push(component);
  this.emit('componentAdded', this, component);
}

/**
 * Entity에서 Component를 제거합니다.
 */
Entity.prototype.remove = function(component) {
  var bitPos;
  if(typeof component == 'function') {
    bitPos = this._engine.getComponentBit(component);
  } else {
    bitPos = this._engine.getComponentBit(component.constructor);
  }
  this.componentBits.set(bitPos, false);
  var orig = this.components[bitPos];
  this.componentsArray.splice(this.componentsArray.indexOf(orig), 1);
  delete this.components[bitPos];
  this.emit('componentRemoved', this, component);
}

Entity.prototype.removeAll = function() {
  while(this.componentsArray.length > 0) {
    this.remove(this.componentsArray[0]);
  }
}

Entity.prototype.get = function(component) {
  var bitPos = this._engine.getComponentBit(component);
  return this.components[bitPos];
}

Entity.prototype.getComponents = function() {
  return this.componentsArray;
}

Entity.prototype.has = function(component) {
  var bitPos = this._engine.getComponentBit(component);
  return this.componentBits.get(bitPos);
}

if(typeof module != 'undefined') {
  module.exports = Entity;
}